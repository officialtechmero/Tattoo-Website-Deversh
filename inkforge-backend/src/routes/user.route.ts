import { FastifyInstance } from "fastify";
import { all, deleteAccount, signin, signup, verifyAccount } from "../controllers/user.controller";

const userRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/signup", signup);
  fastify.post("/signin", signin);

  fastify.get("/", all)

  fastify.put("/verify-account", verifyAccount);

  fastify.delete("/delete-account", deleteAccount);
}

export default userRoutes;