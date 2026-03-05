import { Worker } from 'bullmq';
import connection from '../config/redis.config';
import type { ConnectionOptions } from 'bullmq';
import scrapePinterest from '../services/scraper.service';
import { db } from '../db/client';
import { imageScraperJobs, scrapeImages } from '../db/schema';
import { eq } from 'drizzle-orm';

const REQUIRED_PINIMG_PREFIX = "https://i.pinimg.com/736x/";

const scrapingImagesWorker = new Worker(
  'scrapingImages',
  async (job) => {
    const jobId = Number(job.id);
    if (!Number.isFinite(jobId)) {
      throw new Error(`Invalid BullMQ job id: ${String(job.id)}`);
    }

    const { query, limit, scrolls } = job.data;

    const results = await scrapePinterest(query, limit, scrolls);
    if(!results?.length) {
      await db.update(imageScraperJobs).set({ status: 'completed' }).where(eq(imageScraperJobs.JobId, jobId));
      return;
    }

    const filteredResults = results.filter((img) => img.src.startsWith(REQUIRED_PINIMG_PREFIX));
    if (!filteredResults.length) {
      await db.update(imageScraperJobs).set({ status: 'completed' }).where(eq(imageScraperJobs.JobId, jobId));
      return;
    }

    const rows = filteredResults.map(img => ({
      query: query,
      imageLink: img.src,
      imageAlt: img.alt
    }));

    await db.insert(scrapeImages).values(rows).onConflictDoNothing();
    await db.update(imageScraperJobs).set({ status: 'completed' }).where(eq(imageScraperJobs.JobId, jobId));
  },
  { connection: connection as ConnectionOptions }
);

export default scrapingImagesWorker;
