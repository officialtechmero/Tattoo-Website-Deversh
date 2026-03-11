import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  adminLogin,
  adminLogout,
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
  const cookieHeader = request.headers.cookie ?? "";
  const cookieToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("tatoo_inkify_admin="))
    ?.split("=")[1];

  const token = bearerToken || (cookieToken ? decodeURIComponent(cookieToken) : null);

  if (!token || !verifyAdminToken(token)) {
    return reply.status(401).send({
      status: "Error",
      message: "Unauthorized",
    });
  }
};

const adminRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/auth/login", adminLogin);
  // Backward-compat alias
  fastify.post("/login", adminLogin);
  fastify.post("/logout", adminLogout);

  fastify.get("/", { preHandler: requireAdminAuth }, getAdmin);
  fastify.get("/images", { preHandler: requireAdminAuth }, getAdmin);
  fastify.get("/jobs", { preHandler: requireAdminAuth }, getScraperJobs);
  fastify.get("/jobs/stream", { preHandler: requireAdminAuth }, streamScraperJobsUpdates);
  fastify.post("/scrap", { preHandler: requireAdminAuth }, scraperInit);
  fastify.delete("/images/:id", { preHandler: requireAdminAuth }, deleteScrapedImage);
}

export default adminRoutes;
