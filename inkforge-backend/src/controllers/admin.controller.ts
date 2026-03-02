import { FastifyReply, FastifyRequest } from "fastify";
import scrapePinterest from "../services/scraper.service";
import { db } from "../db/client";
import { scrapeImages } from "../db/schema";

export const getAdmin = async (req: FastifyRequest, res: FastifyReply) => {
  try{
    const images = await db.select().from(scrapeImages);
    return res.send({
      status: "Okay",
      total: images.length,
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
    if (!results || results.length === 0) {
      return res.send({
        message: "Query already scraped or no images found",
        images: []
      });
    }

    const rows = results.map(img => ({
      query: query,
      imageLink: img.src,
      imageAlt: img.alt
    }));

    await db.insert(scrapeImages).values(rows).onConflictDoNothing();

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