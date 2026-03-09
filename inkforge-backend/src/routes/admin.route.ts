import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  adminLogin,
  deleteScrapedImage,
  getAdmin,
  getScraperJobs,
  scraperInit,
  streamScraperJobsUpdates,
} from "../controllers/admin.controller";
import { getBearerToken, verifyAdminToken } from "../utils/adminAuth";

const requireAdminAuth = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const bearerToken = getBearerToken(request.headers.authorization);
  if (!bearerToken || !verifyAdminToken(bearerToken)) {
    return reply.status(401).send({
      status: "Error",
      message: "Unauthorized",
    });
  }
};

const adminRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/auth/login", adminLogin);

  fastify.get("/", { preHandler: requireAdminAuth }, getAdmin);
  fastify.get("/images", { preHandler: requireAdminAuth }, getAdmin);
  fastify.get("/jobs", { preHandler: requireAdminAuth }, getScraperJobs);
  fastify.get("/jobs/stream", { preHandler: requireAdminAuth }, streamScraperJobsUpdates);
  fastify.post("/scrap", { preHandler: requireAdminAuth }, scraperInit);
  fastify.delete("/images/:id", { preHandler: requireAdminAuth }, deleteScrapedImage);
}

export default adminRoutes;
