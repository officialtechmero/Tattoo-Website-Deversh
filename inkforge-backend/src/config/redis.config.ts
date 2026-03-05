import 'dotenv/config';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

connection.on("connect", () => {
  console.info(`Redis connected`);
});

connection.on("error", (e) => {
  console.error(`Redis error`, e);
});

export default connection;
