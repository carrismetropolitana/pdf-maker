import { $, write } from 'bun';
import { readdir,mkdir } from 'fs/promises';

import { formatDate } from './utils';
import { rename } from 'fs/promises';

export default async function makePdfs(fileBytes: Uint8Array, area: string, wantedLines: string[], excludedLines: string[], validFrom: string) {
	console.log('validFrom', validFrom);
	// Define a function for cleanup
	async function cleanup() {
		console.log('Cleaning up...');
		PARSE_NETWORK?.kill();
		STANDALONE?.kill();
		QUEUE_MANAGER?.kill();
		PRINTER?.kill();
	}

	// Trap SIGINT signal (Ctrl+C)
	process.once('SIGINT', cleanup);

	console.log('Writing GTFS file...', fileBytes.length);
	await write('../parse-network/gtfs.zip', fileBytes);
	await $`zip ../gtfs.zip *`.cwd('../parse-network/extraGtfsFiles');
	const PATH = Bun.env['PATH']?.split(':').filter(path => !path.includes('/tmp/bun-node')).join(':') || '';

	// Define PIDs for processes

	// Start the API server and save its PID
	const environment = {
		NETWORKDB_HOST: 'localhost',
		NETWORKDB_PASSWORD: 'networkdbpassword',
		NETWORKDB_USER: 'networkdbuser',
		SERVERDB_HOST: 'localhost',
	};
	// console.log('Starting gtfs parser...');
	const PARSE_NETWORK = (Bun.spawn(['npm', 'run', 'start'], {
		cwd: '../parse-network',
		env: {
			...process.env,
			...environment,
			GTFS_URL: 'file://gtfs.zip',
			PATH,
			SINGLE_RUN: 'true',
			INCLUDED_LINES: JSON.stringify(wantedLines),
			EXCLUDED_LINES: JSON.stringify(excludedLines),
		},
		stdout: 'inherit',
	}));

	console.log('Building renderer...');
	await $`npm run build`
		.cwd('../renderer')
		.env({
			...process.env,
			NODE_ENV: 'production',
			PATH,
		})
		.catch(console.error);
	// console.log('Build exited with', await BUILD_RENDERER.exited);
	await $`cp .next/static .next/standalone/.next/static -r`.cwd('../renderer');

	await PARSE_NETWORK.exited;

	// // Start the standalone server and save its PID
	console.log('Starting Next.js server...');
	const STANDALONE = Bun.spawn(['node', '.next/standalone/server.js'],
		{
			cwd: '../renderer',
			env: {
				...process.env,
				API_URL: 'http://localhost:5050',
				PATH,
				PORT: '5051',
				VALID_FROM_DATE: validFrom,
			},
			// stderr: 'inherit',
			// stdout: 'inherit',
		});

	// Start the queue manager and save its PID
	await new Promise(resolve => setTimeout(resolve, 5000));
	const QUEUE_MANAGER = (Bun.spawn(['npm', 'run', 'start'], {
		cwd: '../queue-manager',
		env: {
			...process.env,
			PATH,
			PORT: '5052',
			SINGLE_RUN: 'true',
		},
		// stderr: 'inherit',
		// stdout: 'inherit',
	}));

	// // Clean up the printer PDFs directory
	await $`rm -rf ../printer/pdfs/* `.catch(() => {
		console.log('No pdfs to delete');
	});

	// Start the printer and save its PID
	await new Promise(resolve => setTimeout(resolve, 5000));
	const PRINTER = (Bun.spawn(['sh', '-c', 'npm run start'], {
		cwd: '../printer',
		env: {
			...process.env,
			PATH,
			RENDER_URL: 'http://localhost:5051/schedule',
			SINGLE_RUN: 'true',
		},
		stderr: 'inherit',
		stdout: 'inherit',
	}));

	// Wait for the queue manager and both printer processes to finish
	await QUEUE_MANAGER?.exited;
	await PRINTER?.exited;

	PARSE_NETWORK.kill();
	STANDALONE.kill();

	// Kill the API server, standalone server, and main API server

	// Organize PDFs and zip them
	const date = new Date();
	const filename = `${formatDate(date)}-A${area}.zip`;
	await $`rm ../result.zip`.catch(() => null);

	const pdfFiles = await readdir('../printer/pdfs');
	const pdfFilesPerStop = new Map<string, string[]>();
	for (const file of pdfFiles) {
		if (!file.endsWith('.pdf')) continue;
		const stopId = file.match(/\d{6}/)?.[0];
		if (!stopId) continue;
		const currentFiles = pdfFilesPerStop.get(stopId);
		if (!currentFiles) {
			pdfFilesPerStop.set(stopId, [file]);
		}
		else {
			currentFiles.push(file);
		}
	}

	for (const [stopId, files] of pdfFilesPerStop) {
		await mkdir(`../printer/pdfs/${stopId}`);
		for (const file of files) {
			await rename(`../printer/pdfs/${file}`, `../printer/pdfs/${stopId}/${file}`);
		}
	}

	await $`zip ../../result.zip */*.pdf`.cwd('../printer/pdfs');
	await $`rsync -P ../result.zip "cmet-storage:/opt/app/static/pdfs/${filename}"`;
	return `https://storage.carrismetropolitana.pt/static/pdfs/${filename}`;
}
