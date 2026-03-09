import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client";
import { imageScraperJobs, scrapeImages } from "../db/schema";
import scrapingImagesQueue from "../queues/scrapingImages.queue";
import { and, desc, ilike, or, sql } from "drizzle-orm";

const normalizeQueryToken = (value: string): string => {
  return value
    .trim()
    .replace(/^[\[\s"'`]+/, "")
    .replace(/[\]\s"'`]+$/, "")
    .trim();
};

const parseQueriesInput = (input: unknown): string[] => {
  if (Array.isArray(input)) {
    return input
      .map((item) => normalizeQueryToken(String(item)))
      .filter(Boolean);
  }

  if (typeof input !== "string") return [];

  const raw = input.trim();
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => normalizeQueryToken(String(item)))
          .filter(Boolean);
      }
    } catch {
      // fallback to comma-based parsing below
    }
  }

  const terms = raw.includes(",") ? raw.split(",") : [raw];
  return terms.map(normalizeQueryToken).filter(Boolean);
};

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

export const getExplore = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { page = "1", limit = "30", search = "", withTotal = "1" } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      withTotal?: string;
    };

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 30));
    const offset = (pageNumber - 1) * limitNumber;
    const searchValue = search.trim();
    const searchWords = searchValue
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
    const shouldCount = withTotal !== "0";

    const whereClause = searchWords.length
      ? and(
          ...searchWords.map((word) =>
            or(
              ilike(scrapeImages.imageAlt, `%${word}%`),
              ilike(scrapeImages.query, `%${word}%`)
            )
          )
        )
      : undefined;

    const imagesQuery = db
      .select({
        id: scrapeImages.id,
        query: scrapeImages.query,
        imageLink: scrapeImages.imageLink,
        imageAlt: scrapeImages.imageAlt,
        created_at: scrapeImages.created_at,
      })
      .from(scrapeImages)
      .where(whereClause)
      .orderBy(desc(scrapeImages.created_at))
      .limit(limitNumber)
      .offset(offset);

    let images: Awaited<typeof imagesQuery> = [];
    let total: number | null = null;
    let totalPages: number | null = null;

    if (shouldCount) {
      const [imagesResult, totalResult] = await Promise.all([
        imagesQuery,
        db
          .select({ count: sql<number>`count(*)` })
          .from(scrapeImages)
          .where(whereClause),
      ]);

      images = imagesResult;
      total = Number(totalResult?.[0]?.count ?? 0);
      totalPages = Math.max(1, Math.ceil(total / limitNumber));
    } else {
      images = await imagesQuery;
    }

    return res.send({
      status: "Okay",
      data: images,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    });
  } catch (e) {
    console.error("Error in explore route", e);
    return res.status(500).send({
      status: "Error",
      message: "Failed to fetch explore images",
    });
  }
};

export const scraperInit = async (req: FastifyRequest, res: FastifyReply) => {
  try{
    const { query, limit, scrolls } = req.body as
      { query: string | string[], limit?: number | string, scrolls?: number | string };
    const queries = parseQueriesInput(query);
    if (!queries.length) {
      return res.status(400).send({
        status: "Error",
        message: "Query is required. Send a string, comma-separated string, or array of strings."
      });
    }

    const limitNumber = Math.max(1, Math.floor(Number(limit) || 50));
    const scrollsNumber = Math.max(1, Math.floor(Number(scrolls) || 8));
    const queuedJobs: Array<{ JobId: number; query: string; status: "processing" }> = [];

    for (const singleQuery of queries) {
      const job = await scrapingImagesQueue.add('scrapingImages', {
        query: singleQuery,
        limit: limitNumber,
        scrolls: scrollsNumber
      });
      const jobId = Number(job.id);
      if (!Number.isFinite(jobId)) {
        throw new Error(`Invalid BullMQ job id: ${String(job.id)}`);
      }

      await db.insert(imageScraperJobs).values({
        JobId: jobId,
        status: 'processing'
      });

      queuedJobs.push({
        JobId: jobId,
        query: singleQuery,
        status: 'processing'
      });
    }

    return res.send({
      status: "Okay",
      message: queuedJobs.length === 1 ? "Scraping job queued" : "Scraping jobs queued",
      totalJobs: queuedJobs.length,
      jobs: queuedJobs,
      data: queuedJobs.length === 1 ? queuedJobs[0] : queuedJobs
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
