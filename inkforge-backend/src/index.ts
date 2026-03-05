import 'dotenv/config';
import Fastify from "fastify";
import { pool } from "./db/client";
import adminRoutes from './routes/admin.route';
import exploreRoutes from './routes/explore.route';
import './workers/scrapingImages.worker';
import { startBunnyUploadService } from './services/bunnyUpload.service';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

app.get("/", async () => ({
  status: "Ok",
  uptime: process.uptime()
}));

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

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
startBunnyUploadService();
