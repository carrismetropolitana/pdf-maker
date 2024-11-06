import { $, write } from 'bun';
import { existsSync, mkdirSync } from 'fs';
import { mkdir, readdir, rename } from 'fs/promises';

import envVars from './env';
import { formatDate } from './utils';

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

	console.log('Writing GTFS file...');
	await write('../parse-network/gtfs.zip', fileBytes);
	await $`zip ../gtfs.zip *`.cwd('../parse-network/extraGtfsFiles');
	const PATH = Bun.env['PATH']?.split(':').filter(path => !path.includes('/tmp/bun-node')).join(':') || '';

	// Define PIDs for processes

	// Start the API server and save its PID
	const environment = {
		NETWORKDB_HOST: envVars.pg.host,
		NETWORKDB_PASSWORD: envVars.pg.pw,
		NETWORKDB_USER: envVars.pg.user,
		REDIS_HOST: envVars.redis.host,
		SERVERDB_HOST: envVars.redis.host,
	};
	console.log('starting parse-network...');
	const PARSE_NETWORK = Bun.spawn(['bun', 'index.ts'], {
		cwd: '../parse-network',
		env: {
			...process.env,
			...environment,
			EXCLUDED_LINES: JSON.stringify(excludedLines),
			GTFS_URL: 'file://gtfs.zip',
			INCLUDED_LINES: JSON.stringify(wantedLines),
			PATH,
			SINGLE_RUN: 'true',
		},
		stderr: 'inherit',
		stdout: 'inherit',
	});
	console.log('parse-network exited with', await PARSE_NETWORK.exited);

	// console.log('Building renderer...');
	// await $`bun run build`
	// 	.cwd('../renderer')
	// 	.env({
	// 		...process.env,
	// 		NODE_ENV: 'production',
	// 		PATH,
	// 	})
	// 	.catch(console.error);
	// // console.log('Build exited with', await BUILD_RENDERER.exited);
	// await $`cp .next/static .next/standalone/.next/static -r`.cwd('../renderer');

	// await PARSE_NETWORK.exited;

	// // Start the standalone server and save its PID
	const STANDALONE = Bun.spawn(['bun', 'server.js'],
		{
			cwd: '../renderer',
			env: {
				...process.env,
				...environment,
				API_URL: 'http://pdf-frontend:5050',
				PATH,
				PORT: '5051',
				VALID_FROM_DATE: validFrom,
			},
			// stderr: 'inherit',
			// stdout: 'inherit',
		});

	const QUEUE_MANAGER = (Bun.spawn(['bun', 'src/index.ts'], {
		cwd: '../queue-manager',
		env: {
			...process.env,
			...environment,
			PATH,
			PORT: '5052',
			SINGLE_RUN: 'true',
		},
		// stderr: 'inherit',
		// stdout: 'inherit',
	}));

	await new Promise(resolve => setTimeout(resolve, 5000));
	console.log('finished starting queue manager');

	// // Clean up the printer PDFs directory
	console.log('Cleaning up printer pdfs...');
	await $`rm -rf ../printer/pdfs/* `.catch(() => {
		console.log('No pdfs to delete');
	});
	console.log('finished cleaning up printer pdfs');

	console.log('Starting printer...');
	const PRINTER = (Bun.spawn(['bun', 'src/index.ts'], {
		cwd: '../printer',
		env: {
			...process.env,
			...environment,
			PATH,
			QUEUE_URL: 'http://pdf-frontend:5052',
			RENDER_URL: 'http://pdf-frontend:5051/schedule',
			SINGLE_RUN: 'true',
		},
		stderr: 'inherit',
		stdout: 'inherit',
	}));

	await new Promise(resolve => setTimeout(resolve, 5000));
	console.log('finished starting printer');

	// Wait for the queue manager and both printer processes to finish
	await QUEUE_MANAGER?.exited;
	await PRINTER?.exited;

	PARSE_NETWORK.kill();
	STANDALONE.kill();

	// Kill the API server, standalone server, and main API server

	// Organize PDFs and zip them
	const date = new Date();
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

	// check if ./files directory exists
	if (!existsSync(`./files`)) {
		mkdirSync(`./files`);
	}
	// move the zip file to the ./files directory

	const filename = `${formatDate(date)}-A${area}.zip`;
	await rename(`../result.zip`, `./files/${filename}`);

	return `./files/${filename}`;
}
