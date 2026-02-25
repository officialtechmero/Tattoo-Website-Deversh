import { config } from "dotenv";
import Fastify from "fastify";
import { db, pool } from "./db/client";
import { users } from "./db/schema";

config();

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

app.get("/", async () => ({
  status: "Ok",
  uptime: process.uptime(),
  message: "InkForge Backend is running..." 
}));

app.get("/users", async () => {
  return db.select().from(users);
});

const start = async () => {
  try {
    await app.listen({ port, host });
    app.log.info(`Server running at http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();