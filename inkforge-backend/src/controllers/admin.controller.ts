import { FastifyReply, FastifyRequest } from "fastify";
import scrapePinterest from "../services/scraper.service";
import { db } from "../db/client";
import { scrapeImages } from "../db/schema";

export const getAdmin = async (req: FastifyRequest, res: FastifyReply) => {
  try{
    const images = await db.select().from(scrapeImages);
    return res.send({
      status: "Okay",
      message: '/ route for admin',
      data: images
    });
  }
  catch(e) {
    console.error("Error in get admin route", e);
    return null;
  }
}

export const scraperInit = async (req: FastifyRequest, res: FastifyReply) => {
  try{
    const {query, limit} = req.body as 
    { query: string, limit: number, scrolls: number };

    const results = await scrapePinterest(query, limit);

    const rows = results.map(img => ({
      query: query,
      imageLink: img.src,
      imageAlt: img.alt
    }));

    await db.insert(scrapeImages).values(rows);

    return res.send({
      inserted: rows.length,
      data: rows
    });
  }
  catch(e) {
    console.error("Error in scraper init route", e);
    return null;
  }
}