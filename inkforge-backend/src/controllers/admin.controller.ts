import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client";
import { imageScraperJobs, scrapeImages } from "../db/schema";
import scrapingImagesQueue from "../queues/scrapingImages.queue";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { generateAdminToken, verifyAdminCredentials } from "../utils/adminAuth";

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
    const { page = "1", limit = "20" } = req.query as { page?: string, limit?: string };

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (pageNumber - 1) * limitNumber;

    const [images, totalResult] = await Promise.all([
      db
        .select({
          id: scrapeImages.id,
          query: scrapeImages.query,
          imageLink: scrapeImages.imageLink,
          imageAlt: scrapeImages.imageAlt,
          created_at: scrapeImages.created_at,
        })
        .from(scrapeImages)
        .orderBy(desc(scrapeImages.created_at))
        .limit(limitNumber)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(scrapeImages),
    ]);

    const total = Number(totalResult?.[0]?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limitNumber));

    return res.send({
      status: "Okay",
      message: "Admin image list",
      data: images,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    });
  }
  catch(e) {
    console.error("Error in get admin route", e);
    return null;
  }
}

export const adminLogin = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { username = "", password = "" } = (req.body ?? {}) as {
      username?: string;
      password?: string;
    };

    if (!verifyAdminCredentials(String(username), String(password))) {
      return res.status(401).send({
        status: "Error",
        message: "Invalid admin credentials",
      });
    }

    const token = generateAdminToken();
    return res.send({
      status: "Okay",
      token,
      message: "Admin login successful",
    });
  } catch (e) {
    console.error("Error in admin login route", e);
    return res.status(500).send({
      status: "Error",
      message: "Failed to login admin",
    });
  }
};

export const getExplore = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { page = "1", limit = "30", search = "", withTotal = "1", random = "0" } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      withTotal?: string;
      random?: string;
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
    const randomOrder = random === "1";

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

    const baseQuery = db
      .select({
        id: scrapeImages.id,
        query: scrapeImages.query,
        imageLink: scrapeImages.imageLink,
        imageAlt: scrapeImages.imageAlt,
        created_at: scrapeImages.created_at,
      })
      .from(scrapeImages)
      .where(whereClause);

    const imagesQuery = randomOrder
      ? baseQuery.orderBy(sql`random()`).limit(limitNumber)
      : baseQuery.orderBy(desc(scrapeImages.created_at)).limit(limitNumber).offset(offset);

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
        page: randomOrder ? 1 : pageNumber,
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

export const getScraperJobs = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { page = "1", limit = "10" } = req.query as { page?: string; limit?: string };
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (pageNumber - 1) * limitNumber;

    const [jobs, totalResult] = await Promise.all([
      db
        .select({
          id: imageScraperJobs.id,
          JobId: imageScraperJobs.JobId,
          status: imageScraperJobs.status,
          created_at: imageScraperJobs.created_at,
          updated_at: imageScraperJobs.updated_at,
        })
        .from(imageScraperJobs)
        .orderBy(desc(imageScraperJobs.updated_at))
        .limit(limitNumber)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(imageScraperJobs),
    ]);

    const total = Number(totalResult?.[0]?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limitNumber));

    return res.send({
      status: "Okay",
      data: jobs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    });
  } catch (e) {
    console.error("Error in scraper jobs route", e);
    return res.status(500).send({
      status: "Error",
      message: "Failed to fetch scraper jobs",
    });
  }
};

export const streamScraperJobsUpdates = async (_req: FastifyRequest, res: FastifyReply) => {
  res.raw.setHeader("Content-Type", "text/event-stream");
  res.raw.setHeader("Cache-Control", "no-cache, no-transform");
  res.raw.setHeader("Connection", "keep-alive");
  res.raw.flushHeaders?.();

  let closed = false;
  let previousSignature = "";

  const sendEvent = (event: string, payload: Record<string, unknown>) => {
    if (closed) return;
    res.raw.write(`event: ${event}\n`);
    res.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const computeSignature = async (): Promise<string> => {
    const summary = await db
      .select({
        count: sql<number>`count(*)`,
        lastUpdate: sql<string | null>`max(${imageScraperJobs.updated_at})`,
      })
      .from(imageScraperJobs);

    const count = Number(summary?.[0]?.count ?? 0);
    const lastUpdate = String(summary?.[0]?.lastUpdate ?? "");
    return `${count}:${lastUpdate}`;
  };

  const checkForChanges = async () => {
    try {
      const nextSignature = await computeSignature();
      if (nextSignature !== previousSignature) {
        previousSignature = nextSignature;
        sendEvent("jobs:update", { changed: true, signature: nextSignature, ts: Date.now() });
      }
    } catch (error) {
      console.error("Error checking job stream updates", error);
      sendEvent("jobs:error", { message: "Failed to check jobs update" });
    }
  };

  sendEvent("jobs:connected", { ok: true, ts: Date.now() });
  await checkForChanges();

  const interval = setInterval(() => {
    void checkForChanges();
  }, 1500);

  const heartbeat = setInterval(() => {
    sendEvent("jobs:heartbeat", { ts: Date.now() });
  }, 30000);

  const close = () => {
    if (closed) return;
    closed = true;
    clearInterval(interval);
    clearInterval(heartbeat);
    res.raw.end();
  };

  _req.raw.on("close", close);
};

export const deleteScrapedImage = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { id } = req.params as { id?: string };
    if (!id) {
      return res.status(400).send({
        status: "Error",
        message: "Image id is required",
      });
    }

    const deleted = await db
      .delete(scrapeImages)
      .where(eq(scrapeImages.id, id))
      .returning({ id: scrapeImages.id });

    if (!deleted.length) {
      return res.status(404).send({
        status: "Error",
        message: "Image not found",
      });
    }

    return res.send({
      status: "Okay",
      message: "Image deleted",
      data: deleted[0],
    });
  } catch (e) {
    console.error("Error in delete scraped image route", e);
    return res.status(500).send({
      status: "Error",
      message: "Failed to delete image",
    });
  }
};
