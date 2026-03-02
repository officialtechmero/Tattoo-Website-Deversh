import { FastifyReply, FastifyRequest } from "fastify";

export const getAdmin = async (req: FastifyRequest, res: FastifyReply) => {
  try{
    return {
      status: "Okay",
      message: '/ route for admin'
    }
  }
  catch(e) {
    console.error("Error in get admin route", e);
    return null;
  }
}