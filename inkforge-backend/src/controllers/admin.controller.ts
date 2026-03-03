import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client";
import { imageScraperJobs, scrapeImages } from "../db/schema";
import scrapingImagesQueue from "../queues/scrapingImages.queue";

export const getAdmin = async (req: FastifyRequest, res: FastifyReply) => {
  try{
    const { page = '1' } = req.query as { page?: string, limit?: string };

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(20);
    const offset = (pageNumber - 1) * limitNumber;

    const images = await db.select().from(scrapeImages).limit(limitNumber).offset(offset)
    return res.send({
      status: "Okay",
      total: images.length,
      message: '/ route for admin',
      data: images,
      page: pageNumber  
    });
  }
  catch(e) {
    console.error("Error in get admin route", e);
    return null;
  }
}

export const scraperInit = async (req: FastifyRequest, res: FastifyReply) => {
  try{
    const {query, limit, scrolls} = req.body as
    { query: string, limit: number, scrolls: number };

    // add process to queue
    const job = await scrapingImagesQueue.add('scrapingImages', { query, limit, scrolls });
    const jobId = Number(job.id);
    if (!Number.isFinite(jobId)) {
      throw new Error(`Invalid BullMQ job id: ${String(job.id)}`);
    }

    // add images scraping job to db
    await db.insert(imageScraperJobs).values({
      JobId: jobId,
      status: 'processing'
    });

    return res.send({
      status: "Okay",
      message: "Scraping job queued",
      data: {
        JobId: jobId,
        status: 'processing'
      }
    });
  }
  catch(e) {
    console.error("Error in scraper init route", e);
    return res.status(500).send({
      status: "Error",
      message: "Failed to queue scraping job"
    });
  }
}
