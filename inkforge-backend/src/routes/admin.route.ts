import { FastifyInstance } from "fastify";
import { getAdmin } from "../controllers/admin.controller";

const adminRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/", getAdmin);
}

export default adminRoutes;