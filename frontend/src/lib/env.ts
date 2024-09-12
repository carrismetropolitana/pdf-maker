
		// NETWORKDB_HOST: 'networkdb',
		// NETWORKDB_PASSWORD: 'networkdbpassword',
		// NETWORKDB_USER: 'networkdbuser',
		// SERVERDB_HOST: 'serverdb',
		// REDIS_HOST: 'serverdb'
const environment = {
  pg:{
    host: Bun.env.NETWORKDB_HOST || 'localhost',
    pw: Bun.env.NETWORKDB_PASSWORD || 'networkdbpassword',
    user: Bun.env.NETWORKDB_USER || 'networkdbuser'
  },
  redis:{
    host: Bun.env.REDIS_HOST || 'localhost'
  }
};

export default environment