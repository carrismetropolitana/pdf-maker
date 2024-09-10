/* * */

import { RedisClientType, createClient } from 'redis';

/* * */

let client: RedisClientType | null = null;
export default async function getRedisClient() {
	if (client) return client;
	client = createClient({ socket: { host: process.env.REDIS_HOST || 'localhost' } });
	client.on('error', err => console.log('Redis Client Error', err));
	client.on('connect', () => console.log('Connected to Redis'));
	await client.connect();
	return client;
}