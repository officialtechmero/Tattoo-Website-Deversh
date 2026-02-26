import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client";
import { users } from "../db/schema";

export const all = async (req: FastifyRequest, rep: FastifyReply) => {
  const allUsers = await db.select().from(users);
  return {
    message: 'all users',
    data: allUsers.length > 0 ? allUsers : "No user found"
  }
}

export const signup = (req: FastifyRequest, rep: FastifyReply) => {
  try{

  }
  catch(e) {
    console.error(`Error in sign up`, e);
    return null;
  }
}

export const signin = (req: FastifyRequest, rep: FastifyReply) => {
  try{

  }
  catch(e) {
    console.error(`Error in sign in`, e);
    return null;
  }
}

export const verifyAccount = (req: FastifyRequest, rep: FastifyReply) => {
  try{
    
  }
  catch(e) {
    console.error(`Error in verify account`, e);
    return null;
  }
}

export const deleteAccount = (req: FastifyRequest, rep: FastifyReply) => {
  try{
    
  }
  catch(e) {
    console.error(`Error in delete account`, e);
    return null;
  }
}