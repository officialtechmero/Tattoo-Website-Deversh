import { FastifyInstance } from "fastify";
import { getExplore } from "../controllers/admin.controller";

const exploreRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/", getExplore);
};

export default exploreRoutes;
