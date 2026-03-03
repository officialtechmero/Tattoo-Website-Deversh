import 'dotenv/config';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.info(`Redis connected`);
});

connection.on("error", (e) => {
  console.error(`Redis error`, e);
});

export default connection;