import 'dotenv/config';
import process from 'process';
import Fastify from 'fastify';
import { start } from 'repl';
const fastify = Fastify({ logger: false });

const API_URL = process.env.API_URL || 'http://localhost:5050';
const LOG_EVERY = parseInt(process.env.LOG_EVERY) || 100;

let updatedAt:string|null = null;
let queue = [];

async function fetchTimetables():Promise<{updated_at:string, pairs:string[]}> {
	console.log('Fetching timetables...');
	let response = await fetch(`${API_URL}/timetables`);
	return response.json();
}

async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
	let i = 0;
	let startTime = process.hrtime.bigint();
	fastify.get('/nextitem', async (request, reply) => {
		if (i % LOG_EVERY === 0) {
			let currentTime = process.hrtime.bigint();
			// log how many items per second we are processing since last log
			console.log(`${String(i).padStart(String(queue.length + i).length)}/${queue.length + i} @ ${(LOG_EVERY / (Number(currentTime - startTime) / 1e9)).toFixed(2)} pdfs/s`);
			startTime = currentTime;
		}
		if (queue.length === 0) {
			return { finished: true, item: null };
		}
		i++;
		return { finished: false, item: queue.shift() };
	});
	fastify.get('/forcerefresh', async (request, reply) => {
		const timetableIndex = await fetchTimetables();
		updatedAt = timetableIndex.updated_at;
		queue = timetableIndex.pairs;
		return { queue: queue.length, updatedAt: updatedAt };
	});
	fastify.get('/status', async (request, reply) => {
		return { ready: updatedAt !== null, queue: queue.length };
	});

	fastify.get('/ready', async (request, reply) => {
		if (updatedAt === null) reply.code(500).send({ status: 'not ready' });
		return { status: 'ok' };
	});

	try {
		await fastify.listen({ port: 5052, host: '0.0.0.0' });
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const timetableIndex = await fetchTimetables();
		if (timetableIndex === null) {
			console.log('No timetables found');
			// Sleep for 10 seconds
			await sleep(10000);
		} else if (timetableIndex.updated_at === updatedAt) {
			console.log('No new timetables found');
			// Sleep for 5 mins
			await sleep(1000 * 60 * 5);
		} else {
			updatedAt = timetableIndex.updated_at;
			queue = timetableIndex.pairs;
			i = 0;
			await sleep(1000 * 60 * 5);
		}
	}
}

main();