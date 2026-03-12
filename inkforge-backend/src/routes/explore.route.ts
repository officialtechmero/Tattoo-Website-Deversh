import { FastifyInstance } from "fastify";
import { getExplore, getExploreById } from "../controllers/admin.controller";

const exploreRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/", getExplore);
  fastify.get("/:id", getExploreById);
};

export default exploreRoutes;
