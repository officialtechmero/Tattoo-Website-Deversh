import { FastifyInstance } from "fastify";
import { getAdmin, scraperInit } from "../controllers/admin.controller";

const adminRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/", getAdmin);
  fastify.post("/scrap", scraperInit);
}

export default adminRoutes;