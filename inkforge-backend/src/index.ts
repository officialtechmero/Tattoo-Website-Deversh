import 'dotenv/config';
import Fastify from "fastify";
import { pool } from "./db/client";
import adminRoutes from './routes/admin.route';
import exploreRoutes from './routes/explore.route';
import './workers/scrapingImages.worker';
import { startBunnyUploadService } from './services/bunnyUpload.service';

const app = Fastify({
  logger: process.env.NODE_ENV === "production"
    ? { level: process.env.LOG_LEVEL ?? "info" }
    : true,
});
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

app.get("/", async () => ({
  status: "Ok",
  uptime: process.uptime()
}));
app.get("/health", async () => ({ status: "Ok" }));
app.get("/ready", async (_, reply) => {
  try {
    await pool.query("select 1");
    return { status: "Ready" };
  } catch {
    return reply.status(503).send({ status: "NotReady" });
  }
});

app.register(adminRoutes, { prefix: '/api/admin' });
app.register(exploreRoutes, { prefix: '/api/explore' });

const start = async () => {
  try {
    await pool.query("select 1");
    app.log.info("Database connection check passed");

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

const failFast = async (reason: unknown) => {
  app.log.error(reason);
  await shutdown();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", failFast);
process.on("unhandledRejection", failFast);

start();
startBunnyUploadService();
