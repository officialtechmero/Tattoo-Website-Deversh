import 'dotenv/config';

// Force-disable Turbopack for stability in custom server mode
if (!process.env.NEXT_DISABLE_TURBOPACK) {
  process.env.NEXT_DISABLE_TURBOPACK = "1";
}
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { pool } from "./db/client";
import adminRoutes from './routes/admin.route';
import exploreRoutes from './routes/explore.route';
import './workers/scrapingImages.worker';
import { startBunnyUploadService } from './services/bunnyUpload.service';
import cors from '@fastify/cors';

import next from "next";
import path from "path";

const dev = process.env.NODE_ENV === "development";

const nextApp = next({
  dev,
  dir: path.join(process.cwd(), "../inkforge-frontend"),
});

const handle = nextApp.getRequestHandler();

const app = Fastify({
  logger: process.env.NODE_ENV === "production"
    ? { level: process.env.LOG_LEVEL ?? "info" }
    : true,
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

app.register(cors, {
  origin: process.env.FRONTEND_URL,
});

app.get("/api/status", async () => ({
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
    await nextApp.prepare();

    await pool.query("select 1");
    app.log.info("Database connection check passed");

    // Next.js handler for all non-api routes (GET/HEAD only to avoid CORS OPTIONS conflicts)
    app.route({
      method: ["GET", "HEAD"],
      url: "/*",
      handler: (req: FastifyRequest, reply: FastifyReply) => {
      const url = req.raw.url ?? "";
      if (url.startsWith("/api") || url.startsWith("/health") || url.startsWith("/ready")) {
        return;
      }

      handle(req.raw, reply.raw);
      reply.hijack();
      },
    });

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

const failFast = async (reason: any) => {
  app.log.error(reason);
  await shutdown();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", failFast);
process.on("unhandledRejection", failFast);

start();
startBunnyUploadService();
