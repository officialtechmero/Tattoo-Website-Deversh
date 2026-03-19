import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client";
import { imageScraperJobs, scrapeImageDownloads, scrapeImageViews, scrapeImages, textGenerationJobs } from "../db/schema";
import scrapingImagesQueue from "../queues/scrapingImages.queue";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { generateAdminToken, verifyAdminCredentials } from "../utils/adminAuth";
import { getKeywordsForCategory } from "../utils/categories";
import textGenerationQueue from "../queues/textGeneration.queue";

const normalizeQueryToken = (value: string): string => {
  return value
    .trim()
    .replace(/^[\[\s"'`]+/, "")
    .replace(/[\]\s"'`]+$/, "")
    .trim();
};

const sanitizeFileName = (input: string) => {
  return input
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
};

const getClientIp = (req: FastifyRequest): string | null => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length) {
    return String(forwarded[0] ?? "").trim() || null;
  }
  const ip = (req as { ip?: string }).ip;
  if (ip) return String(ip);
  const socketIp = req.socket?.remoteAddress;
  return socketIp ? String(socketIp) : null;
};

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
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
  try {
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
          title: scrapeImages.title,
          description: scrapeImages.description,
          tags: scrapeImages.tags,
          views: scrapeImages.views,
          downloads: scrapeImages.downloads,
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
  catch (e) {
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
    const maxAgeSeconds = 60 * 60 * 12;
    const isProd = process.env.NODE_ENV === "production";
    const cookie = [
      `tatoo_inkify_admin=${token}`,
      "Path=/",
      "SameSite=Lax",
      `Max-Age=${maxAgeSeconds}`,
      isProd ? "Secure" : "",
      "HttpOnly",
    ]
      .filter(Boolean)
      .join("; ");

    res.header("Set-Cookie", cookie);
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

export const adminLogout = async (_req: FastifyRequest, res: FastifyReply) => {
  const isProd = process.env.NODE_ENV === "production";
  const cookie = [
    "tatoo_inkify_admin=",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
    isProd ? "Secure" : "",
    "HttpOnly",
  ]
    .filter(Boolean)
    .join("; ");

  res.header("Set-Cookie", cookie);
  return res.send({ status: "Okay", message: "Logged out" });
};

export const getExplore = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { page = "1", limit = "30", search = "", tag = "", withTotal = "1", random = "0", category = "" } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      tag?: string;
      withTotal?: string;
      random?: string;
      category?: string;
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
    const tagValue = tag.trim().toLowerCase();
    const tagConditionSql = tagValue
      ? sql`${scrapeImages.tags} @> ARRAY[${tagValue}]::text[]`
      : null;

    const searchConditions = searchWords.map((word) => {
      const pattern = `%${word}%`;
      return sql`(${scrapeImages.imageAlt} ILIKE ${pattern} OR ${scrapeImages.query} ILIKE ${pattern} OR ${scrapeImages.tags}::text ILIKE ${pattern})`;
    });

    const categorySlug = category.trim().toLowerCase();
    const categoryKeywords = categorySlug && categorySlug !== "all" ? getKeywordsForCategory(categorySlug) : null;

    let categoryConditionSql = sql``;
    let categoryConditionDrizzle = undefined;
    let hasCategoryFilter = false;

    if (categoryKeywords && categoryKeywords.length > 0) {
      hasCategoryFilter = true;
      const keywordConditions = categoryKeywords.map((kw) => {
        const pattern = `%${kw}%`;
        return sql`(${scrapeImages.imageAlt} ILIKE ${pattern})`;
      });
      categoryConditionSql = sql`(${sql.join(keywordConditions, sql` OR `)})`;

      categoryConditionDrizzle = or(
        ...categoryKeywords.map((kw) => ilike(scrapeImages.imageAlt, `%${kw}%`))
      );
    }

    const allSqlConditions = [];
    if (searchConditions.length) {
      allSqlConditions.push(...searchConditions);
    }
    if (hasCategoryFilter) {
      allSqlConditions.push(categoryConditionSql);
    }
    if (tagConditionSql) {
      allSqlConditions.push(tagConditionSql);
    }

    const rawWhereClause = allSqlConditions.length
      ? sql`WHERE ${sql.join(allSqlConditions, sql` AND `)}`
      : sql``;

    const allDrizzleConditions = [];
    if (searchWords.length) {
      allDrizzleConditions.push(
        ...searchWords.map((word) =>
          or(
            ilike(scrapeImages.imageAlt, `%${word}%`),
            ilike(scrapeImages.query, `%${word}%`),
            sql`${scrapeImages.tags}::text ILIKE ${`%${word}%`}`
          )
        )
      );
    }
    if (categoryConditionDrizzle) {
      allDrizzleConditions.push(categoryConditionDrizzle);
    }
    if (tagConditionSql) {
      allDrizzleConditions.push(tagConditionSql);
    }

    const whereClause = allDrizzleConditions.length
      ? and(...allDrizzleConditions)
      : undefined;

    let images: Array<{
      id: string;
      query: string;
      imageLink: string;
      imageAlt: string;
      title: string | null;
      description: string | null;
      tags: string[] | null;
      views: number | null;
      downloads: number | null;
      created_at: Date;
    }> = [];
    const mapRandomRows = (rows: Record<string, unknown>[]) =>
      rows.map((row) => ({
        id: String(row.id ?? ""),
        query: String(row.query ?? ""),
        imageLink: String(row.imageLink ?? ""),
        imageAlt: String(row.imageAlt ?? ""),
        title: row.title ? String(row.title) : null,
        description: row.description ? String(row.description) : null,
        tags: Array.isArray(row.tags) ? (row.tags as string[]) : null,
        views: typeof row.views === "number" ? row.views : row.views ? Number(row.views) : null,
        downloads: typeof row.downloads === "number" ? row.downloads : row.downloads ? Number(row.downloads) : null,
        created_at: row.created_at instanceof Date
          ? row.created_at
          : new Date(String(row.created_at ?? "")),
      }));
    let total: number | null = null;
    let totalPages: number | null = null;

    if (randomOrder) {
      const randomRowsPromise = db.execute(sql`
        SELECT id, query, image_link AS "imageLink", image_alt AS "imageAlt", title, description, tags, views, downloads, created_at
        FROM (
          SELECT DISTINCT ON (lower(${scrapeImages.query}))
            ${scrapeImages.id} AS id,
            ${scrapeImages.query} AS query,
            ${scrapeImages.imageLink} AS image_link,
            ${scrapeImages.imageAlt} AS image_alt,
            ${scrapeImages.title} AS title,
            ${scrapeImages.description} AS description,
            ${scrapeImages.tags} AS tags,
            ${scrapeImages.views} AS views,
            ${scrapeImages.downloads} AS downloads,
            ${scrapeImages.created_at} AS created_at
          FROM ${scrapeImages}
          ${rawWhereClause}
          ORDER BY lower(${scrapeImages.query}), random()
        ) AS unique_by_query
        ORDER BY random()
        LIMIT ${limitNumber}
      `);

      if (shouldCount) {
        const [imagesResult, totalResult] = await Promise.all([
          randomRowsPromise,
          db.execute<{ count: number }>(sql`
            SELECT count(DISTINCT lower(${scrapeImages.query}))::int AS count
            FROM ${scrapeImages}
            ${rawWhereClause}
          `),
        ]);

        images = mapRandomRows(imagesResult.rows);
        total = Number((totalResult.rows?.[0] as { count?: number } | undefined)?.count ?? 0);
        totalPages = Math.max(1, Math.ceil(total / limitNumber));
      } else {
        const imagesResult = await randomRowsPromise;
        images = mapRandomRows(imagesResult.rows);
      }
    } else {
      const baseQuery = db
      .select({
        id: scrapeImages.id,
        query: scrapeImages.query,
        imageLink: scrapeImages.imageLink,
        imageAlt: scrapeImages.imageAlt,
        title: scrapeImages.title,
        description: scrapeImages.description,
        tags: scrapeImages.tags,
        views: scrapeImages.views,
        downloads: scrapeImages.downloads,
        created_at: scrapeImages.created_at,
      })
        .from(scrapeImages)
        .where(whereClause);

      const imagesQuery = baseQuery
        .orderBy(desc(scrapeImages.created_at))
        .limit(limitNumber)
        .offset(offset);

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
    }

    const cacheControl = randomOrder ? "no-store" : "public, max-age=60, stale-while-revalidate=120";
    res.header("Cache-Control", cacheControl);
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

export const getExploreById = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { id } = req.params as { id?: string };
    if (!id) {
      return res.status(400).send({
        status: "Error",
        message: "Image id is required",
      });
    }

    const isFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isFullUuid ? eq(scrapeImages.id, id) : sql`${scrapeImages.id}::text ILIKE ${id + "%"}`;

    const images = await db
      .select({
        id: scrapeImages.id,
        query: scrapeImages.query,
        imageLink: scrapeImages.imageLink,
        imageAlt: scrapeImages.imageAlt,
        title: scrapeImages.title,
        description: scrapeImages.description,
        tags: scrapeImages.tags,
        views: scrapeImages.views,
        downloads: scrapeImages.downloads,
        created_at: scrapeImages.created_at,
      })
      .from(scrapeImages)
      .where(condition)
      .limit(1);

    let image = images?.[0];
    if (!image) {
      return res.status(404).send({
        status: "Error",
        message: "Image not found",
      });
    }

    const clientIp = getClientIp(req);
    if (clientIp) {
      try {
        const inserted = await db
          .insert(scrapeImageViews)
          .values({ image_id: image.id, ip: clientIp })
          .onConflictDoNothing()
          .returning({ id: scrapeImageViews.id });

        if (inserted.length) {
          await db
            .update(scrapeImages)
            .set({ views: sql`COALESCE(${scrapeImages.views}, 0) + 1` })
            .where(eq(scrapeImages.id, image.id));
          image = {
            ...image,
            views: (image.views ?? 0) + 1,
          };
        }
      } catch (error) {
        console.error("Error updating view count", error);
      }
    }

    res.header("Cache-Control", "no-store");
    return res.send({
      status: "Okay",
      data: image,
    });
  } catch (e) {
    console.error("Error in explore by id route", e);
    return res.status(500).send({
      status: "Error",
      message: "Failed to fetch explore image",
    });
  }
};

export const scraperInit = async (req: FastifyRequest, res: FastifyReply) => {
  try {
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
  catch (e) {
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

export const downloadImage = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { url: urlParam, name: nameParam = "tattoo-image", imageId } = req.query as {
      url?: string;
      name?: string;
      imageId?: string;
    };

    if (!urlParam) {
      return res.status(400).send({ message: "Missing url parameter" });
    }

    let imageUrl = urlParam;
    if (urlParam.startsWith("/")) {
      const host = req.headers.host || "localhost:5051";
      const protocol = req.protocol || "http";
      imageUrl = `${protocol}://${host}${urlParam}`;
    }

    const upstream = await fetch(imageUrl, {
      method: "GET",
      headers: { accept: "image/*" },
    });

    if (!upstream.ok) {
      return res.status(502).send({ message: "Failed to fetch source image" });
    }

    const contentType = upstream.headers.get("content-type")?.split(";")[0].trim() || "image/jpeg";
    const ext = CONTENT_TYPE_TO_EXT[contentType] ?? "jpg";
    const safeName = sanitizeFileName(String(nameParam)) || "tattoo-image";
    const fileName = `${safeName}.${ext}`;
    
    const buffer = Buffer.from(await upstream.arrayBuffer());

    if (imageId) {
      const clientIp = getClientIp(req);
      if (clientIp) {
        try {
          const inserted = await db
            .insert(scrapeImageDownloads)
            .values({ image_id: imageId, ip: clientIp })
            .onConflictDoNothing()
            .returning({ id: scrapeImageDownloads.id });

          if (inserted.length) {
            await db
              .update(scrapeImages)
              .set({ downloads: sql`COALESCE(${scrapeImages.downloads}, 0) + 1` })
              .where(eq(scrapeImages.id, imageId));
          }
        } catch (error) {
          console.error("Error updating download count", error);
        }
      }
    }

    return res
      .header("Content-Type", contentType)
      .header("Content-Disposition", `attachment; filename="${fileName}"`)
      .header("Cache-Control", "no-store")
      .send(buffer);
  } catch (error) {
    console.error("Download Image Error:", error);
    return res.status(500).send({ message: "Image download failed" });
  }
};

export const textGeneration = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const images = await db
      .select({
        id: scrapeImages.id,
        title: scrapeImages.title,
        description: scrapeImages.description,
        tags: scrapeImages.tags,
      })
      .from(scrapeImages);

    const pendingIds = images
      .filter((image) => {
        const hasTitle = typeof image.title === "string" && image.title.trim().length > 0;
        const hasDescription = typeof image.description === "string" && image.description.trim().length > 0;
        const hasTags = Array.isArray(image.tags) && image.tags.length > 0;
        return !(hasTitle && hasDescription && hasTags);
      })
      .map((image) => image.id);

    const MAX_IMAGES_PER_JOB = 100;
    const jobs: Array<{ jobId: number; count: number }> = [];

    for (let i = 0; i < pendingIds.length; i += MAX_IMAGES_PER_JOB) {
      const chunk = pendingIds.slice(i, i + MAX_IMAGES_PER_JOB);
      const job = await textGenerationQueue.add("textGeneration", { imageIds: chunk });
      const jobId = Number(job.id);
      if (!Number.isFinite(jobId)) {
        throw new Error(`Invalid BullMQ job id: ${String(job.id)}`);
      }
      await db.insert(textGenerationJobs).values({
        JobId: jobId,
        status: "queued",
        total_images: chunk.length,
      });
      jobs.push({ jobId, count: chunk.length });
    }

    return res.send({
      status: "Okay",
      totalImages: pendingIds.length,
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Error in text generation route", error);
    return res.status(500).send({
      status: "Error",
      message: "Failed to queue text generation jobs",
    });
  }
}

export const getTextGenerationJobs = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { page = "1", limit = "10" } = req.query as { page?: string; limit?: string };
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (pageNumber - 1) * limitNumber;

    const [jobs, totalResult] = await Promise.all([
      db
        .select({
          id: textGenerationJobs.id,
          JobId: textGenerationJobs.JobId,
          status: textGenerationJobs.status,
          total_images: textGenerationJobs.total_images,
          updated: textGenerationJobs.updated,
          skipped: textGenerationJobs.skipped,
          failed: textGenerationJobs.failed,
          error_message: textGenerationJobs.error_message,
          created_at: textGenerationJobs.created_at,
          updated_at: textGenerationJobs.updated_at,
        })
        .from(textGenerationJobs)
        .orderBy(desc(textGenerationJobs.updated_at))
        .limit(limitNumber)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(textGenerationJobs),
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
    console.error("Error in text generation jobs route", e);
    return res.status(500).send({
      status: "Error",
      message: "Failed to fetch text generation jobs",
    });
  }
};
