function parseOrNull(value:string){
  try {
    return JSON.parse(value);
  }catch(e){
    return [];
  }
}

const env = {
  pg: {
    database: process.env.NETWORKDB_USER,
    host: process.env.NETWORKDB_HOST,
    password: process.env.NETWORKDB_PASSWORD,
    user: process.env.NETWORKDB_USER,
  },
  redis: {
    host: process.env.SERVERDB_HOST
  },
  timetable: {
    includedLines: parseOrNull(process.env.INCLUDED_LINES) as string[],
    excludedLines: parseOrNull(process.env.EXCLUDED_LINES) as string[],
  },
}

if (env.pg.database === undefined) {
  throw new Error('Missing required environment variable NETWORKDB_USER')
}
if (env.pg.host === undefined) {
  throw new Error('Missing required environment variable NETWORKDB_HOST')
}
if (env.pg.password === undefined) {
  throw new Error('Missing required environment variable NETWORKDB_PASSWORD')
}
if (env.pg.user === undefined) {
  throw new Error('Missing required environment variable NETWORKDB_USER')
}
if (env.redis.host === undefined) {
  throw new Error('Missing required environment variable SERVERDB_HOST')
}

export default env;
