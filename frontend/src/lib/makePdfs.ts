import { $, write } from 'bun';
import { mkdir, readdir, rename, rm } from 'fs/promises';

import envVars from './env';
import { formatDate } from './utils';

const QUEUE_URL = 'http://127.0.0.1:5052';
const RENDER_URL = 'http://127.0.0.1:5051/schedule';

async function waitForQueue(timeoutMs = 30_000) {
	const deadline = Date.now() + timeoutMs;
	let lastError: unknown;

	while (Date.now() < deadline) {
		try {
			const response = await fetch(`${QUEUE_URL}/status`);
			if (response.ok) {
				const status = await response.json() as { ready: boolean, queue: number };
				if (status.ready) {
					if (status.queue === 0) {
						throw new Error('Queue manager loaded 0 timetable pairs');
					}
					console.log(`Queue manager ready with ${status.queue} timetable pairs`);
					return;
				}
			}
		}
		catch (error) {
			if (error instanceof Error && error.message.includes('loaded 0 timetable pairs')) throw error;
			lastError = error;
		}
		await new Promise(resolve => setTimeout(resolve, 250));
	}

	throw new Error(`Queue manager did not become ready within ${timeoutMs / 1000}s`, { cause: lastError });
}

async function waitForRenderer(timeoutMs = 30_000) {
	const deadline = Date.now() + timeoutMs;
	let lastError: unknown;

	while (Date.now() < deadline) {
		try {
			const response = await fetch(RENDER_URL.replace(/\/schedule$/, ''));
			if (response.ok || response.status === 404) {
				console.log('Renderer ready');
				return;
			}
		}
		catch (error) {
			lastError = error;
		}
		await new Promise(resolve => setTimeout(resolve, 250));
	}

	throw new Error(`Renderer did not become ready within ${timeoutMs / 1000}s`, { cause: lastError });
}

export default async function makePdfs(fileBytes: Uint8Array, area: string, wantedLines: string[], excludedLines: string[], validFrom: string, sortBy: 'stop' | 'line' = 'stop') {
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
				HOSTNAME: '0.0.0.0',
				PATH,
				PORT: '5051',
				VALID_FROM_DATE: validFrom,
			},
			stderr: 'inherit',
			stdout: 'inherit',
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
		stderr: 'inherit',
		stdout: 'inherit',
	}));

	try {
		await Promise.all([waitForQueue(), waitForRenderer()]);
	}
	catch (error) {
		QUEUE_MANAGER.kill();
		STANDALONE.kill();
		throw error;
	}
	console.log('finished starting queue manager');

	// Clean up the printer PDFs directory
	console.log('Cleaning up printer pdfs...');
	await rm('../printer/pdfs', { recursive: true, force: true });
	await mkdir('../printer/pdfs', { recursive: true });
	console.log('finished cleaning up printer pdfs');

	console.log('Starting printer...');
	const PRINTER = (Bun.spawn(['bun', 'src/index.ts'], {
		cwd: '../printer',
		env: {
			...process.env,
			...environment,
			PATH,
			QUEUE_URL,
			RENDER_URL,
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
	await rm('../result.zip', { force: true });

	const pdfFiles = (await readdir('../printer/pdfs')).filter(file => file.endsWith('.pdf'));
	if (pdfFiles.length === 0) {
		throw new Error('Printer completed without rendering any PDFs');
	}

	const pdfFilesPerStop = new Map<string, string[]>();
	for (const file of pdfFiles) {
		const stopId = sortBy === 'stop' ? file.match(/\d{4}/)?.[0] : file.match(/\d{6}/)?.[0];
		if (!stopId) continue;
		const currentFiles = pdfFilesPerStop.get(stopId);
		if (!currentFiles) {
			pdfFilesPerStop.set(stopId, [file]);
		}
		else {
			currentFiles.push(file);
		}
	}

	const archiveFiles: string[] = [];
	for (const [stopId, files] of pdfFilesPerStop) {
		await mkdir(`../printer/pdfs/${stopId}`);
		for (const file of files) {
			await rename(`../printer/pdfs/${file}`, `../printer/pdfs/${stopId}/${file}`);
			archiveFiles.push(`${stopId}/${file}`);
		}
	}

	if (archiveFiles.length === 0) {
		throw new Error('Rendered PDFs could not be grouped for the result archive');
	}

	const zipProcess = Bun.spawn(['zip', '../../result.zip', ...archiveFiles], {
		cwd: '../printer/pdfs',
		stderr: 'inherit',
		stdout: 'inherit',
	});
	const zipExitCode = await zipProcess.exited;
	if (zipExitCode !== 0) {
		throw new Error(`Failed to create result archive (zip exited with ${zipExitCode})`);
	}

	await mkdir('./files', { recursive: true });
	// move the zip file to the ./files directory

	const filename = `${formatDate(date)}-A${area}.zip`;
	await rename(`../result.zip`, `./files/${filename}`);

	return `./files/${filename}`;
}
