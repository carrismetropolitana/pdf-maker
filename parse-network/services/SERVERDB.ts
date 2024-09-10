/* * */

import env from '@/config/env.js';
import type { RedisClientType } from '@redis/client';

import { createClient } from '@redis/client';

/* * */

class SERVERDB {
	//

	client: RedisClientType;

	async connect() {
		this.client = createClient({ socket: { host: env.redis.host } });
		await this.client.connect();
		console.log(`⤷ Connected to SERVERDB.`);
	}

	async disconnect() {
		await this.client.disconnect();
		this.client = null;
		console.log(`⤷ Disconnected from SERVERDB.`);
	}

	//
}

/* * */

const serverdb = new SERVERDB();

/* * */

export default serverdb;
