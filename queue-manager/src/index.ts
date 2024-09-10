import 'dotenv/config';
import process from 'process';
import Fastify from 'fastify';
import getRedisClient from './redis';
const fastify = Fastify({ logger: false });

const LOG_EVERY = parseInt(process.env.LOG_EVERY) || 100;
const SINGLE_RUN = process.env.SINGLE_RUN == 'true' || false;
const PORT = parseInt(process.env.PORT) || 5052;

let updatedAt:string|null = null;
let queue = [];

async function fetchTimetables():Promise<{updated_at:string, pairs:string[]}> {
	console.log('Fetching timetables...');
	const REDIS = await getRedisClient();
	let response = await REDIS.get('timetables:index');
	console.log('queue fetch timetables', response);
	return JSON.parse(response);
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
			if (SINGLE_RUN && updatedAt != null) setTimeout(() => { process.exit(0); }, 1000);
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
		await fastify.listen({ port: PORT, host: '0.0.0.0' });
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
console.log(`Queue Manager running on port ${PORT}`);

main();