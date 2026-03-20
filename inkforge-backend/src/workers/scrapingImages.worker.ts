import { Worker } from 'bullmq';
import connection from '../config/redis.config';
import type { ConnectionOptions } from 'bullmq';
import scrapePinterest from '../services/scraper.service';
import { db } from '../db/client';
import { imageScraperJobs, scrapeImages } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { mkdir, writeFile, access, unlink } from 'node:fs/promises';
import path from 'node:path';
import { generateTextForImageIds } from '../services/textGeneration.service';
import { hasBunnyConfig, uploadLocalFileToBunny } from '../services/bunnyUpload.service';

const REQUIRED_PINIMG_PREFIX = "https://i.pinimg.com/736x/";
const DOWNLOAD_DIR = path.resolve(process.cwd(), "downloads");
const SCRAPER_RETRY_DELAY_MS = 3000;
// 0 or less means retry forever
const SCRAPER_MAX_ATTEMPTS = Number(process.env.SCRAPER_MAX_ATTEMPTS ?? "0");

const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const sanitizeFileName = (input: string): string => {
  const cleaned = input
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .slice(0, 120);

  return cleaned || "untitled-image";
};

const getExtensionFromUrl = (url: string): string | null => {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).replace(".", "").toLowerCase();
    if (ext && ext.length <= 5) return ext;
    return null;
  } catch {
    return null;
  }
};

const getExtensionFromContentType = (contentType: string | null): string | null => {
  if (!contentType) return null;
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  return CONTENT_TYPE_EXTENSIONS[normalized] ?? null;
};

const resolveUniqueFilePath = async (dir: string, baseName: string, ext: string): Promise<string> => {
  let filePath = path.join(dir, `${baseName}.${ext}`);
  let suffix = 1;

  while (true) {
    try {
      await access(filePath);
      filePath = path.join(dir, `${baseName}-${suffix}.${ext}`);
      suffix += 1;
    } catch {
      return filePath;
    }
  }
};

const delay = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const downloadImageToDisk = async (url: string, alt: string, index: number): Promise<string> => {
  const response = await fetch(url, {
    method: "GET",
    headers: { accept: "image/*" },
  });

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const extension =
    getExtensionFromContentType(response.headers.get("content-type")) ??
    getExtensionFromUrl(url) ??
    "jpg";

  const fallbackName = `image-${index + 1}`;
  const baseName = sanitizeFileName(alt || fallbackName);
  const targetPath = await resolveUniqueFilePath(DOWNLOAD_DIR, baseName, extension);
  const bytes = await response.arrayBuffer();
  await writeFile(targetPath, Buffer.from(bytes));
  return targetPath;
};

const scrapeWithRetry = async (query: string, limit: number, scrolls: number) => {
  let attempt = 0;
  while (true) {
    attempt += 1;
    const results = await scrapePinterest(query, limit, scrolls);
    if (results?.length) return results;

    const shouldRetry = SCRAPER_MAX_ATTEMPTS <= 0 || attempt < SCRAPER_MAX_ATTEMPTS;
    if (!shouldRetry) return [];

    console.warn(`[scraper] No results for "${query}". Retrying in ${SCRAPER_RETRY_DELAY_MS}ms (attempt ${attempt}).`);
    await delay(SCRAPER_RETRY_DELAY_MS);
  }
};

const scrapingImagesWorker = new Worker(
  'scrapingImages',
  async (job) => {
    const jobId = Number(job.id);
    if (!Number.isFinite(jobId)) {
      throw new Error(`Invalid BullMQ job id: ${String(job.id)}`);
    }

    try {
      const { query, limit, scrolls } = job.data;

      const results = await scrapeWithRetry(query, limit, scrolls);
      if(!results?.length) {
        await db.update(imageScraperJobs).set({ status: 'failed' }).where(eq(imageScraperJobs.JobId, jobId));
        return;
      }

      const filteredResults = results.filter((img) => img.src.startsWith(REQUIRED_PINIMG_PREFIX));
      if (!filteredResults.length) {
        await db.update(imageScraperJobs).set({ status: 'failed' }).where(eq(imageScraperJobs.JobId, jobId));
        return;
      }

      const candidateLinks = filteredResults.map((img) => img.src);
      const existingRows = await db
        .select({ imageLink: scrapeImages.imageLink })
        .from(scrapeImages)
        .where(inArray(scrapeImages.imageLink, candidateLinks));
      const existingLinks = new Set(existingRows.map((row) => row.imageLink));
      const uniqueResults = filteredResults.filter((img) => !existingLinks.has(img.src));

      if (!uniqueResults.length) {
        await db.update(imageScraperJobs).set({ status: 'completed' }).where(eq(imageScraperJobs.JobId, jobId));
        return;
      }

      await mkdir(DOWNLOAD_DIR, { recursive: true });
      const manifest: Array<{ sourceUrl: string; localPath: string; alt: string; query: string }> = [];
      for (let i = 0; i < uniqueResults.length; i++) {
        const image = uniqueResults[i];
        try {
          const localPath = await downloadImageToDisk(image.src, image.alt, i);
          manifest.push({
            sourceUrl: image.src,
            localPath,
            alt: image.alt,
            query,
          });
        } catch (error) {
          console.error(`[scraper] Failed to save image locally: ${image.src}`, error);
        }
      }

      if (!manifest.length) {
        await db.update(imageScraperJobs).set({ status: 'failed' }).where(eq(imageScraperJobs.JobId, jobId));
        return;
      }

      const rows = manifest.map((file) => ({
        query: file.query,
        imageLink: file.sourceUrl,
        imageAlt: file.alt
      }));

      const insertedRows = await db
        .insert(scrapeImages)
        .values(rows)
        .onConflictDoNothing()
        .returning({ id: scrapeImages.id, imageLink: scrapeImages.imageLink });

      const insertedIdBySource = new Map<string, string>(
        insertedRows.map((row) => [row.imageLink, row.id])
      );

      const uploadTargets = manifest.filter((file) => insertedIdBySource.has(file.sourceUrl));
      if (!uploadTargets.length) {
        for (const file of manifest) {
          await unlink(file.localPath).catch(() => undefined);
        }
        await db.update(imageScraperJobs).set({ status: 'completed' }).where(eq(imageScraperJobs.JobId, jobId));
        return;
      }

      if (!hasBunnyConfig()) {
        for (const file of uploadTargets) {
          await unlink(file.localPath).catch(() => undefined);
        }
        await db.update(imageScraperJobs).set({ status: 'failed' }).where(eq(imageScraperJobs.JobId, jobId));
        return;
      }

      const uploadedIds: string[] = [];
      for (const file of uploadTargets) {
        const id = insertedIdBySource.get(file.sourceUrl);
        if (!id) continue;
        try {
          const publicUrl = await uploadLocalFileToBunny(file.localPath, file.alt);
          await db
            .update(scrapeImages)
            .set({ imageLink: publicUrl })
            .where(eq(scrapeImages.id, id));
          uploadedIds.push(id);
        } catch (error) {
          console.error(`[scraper] Failed to upload image: ${file.sourceUrl}`, error);
          await db.delete(scrapeImages).where(eq(scrapeImages.id, id));
        } finally {
          await unlink(file.localPath).catch(() => undefined);
        }
      }

      if (!uploadedIds.length) {
        await db.update(imageScraperJobs).set({ status: 'failed' }).where(eq(imageScraperJobs.JobId, jobId));
        return;
      }

      await generateTextForImageIds(uploadedIds);
      await db.update(imageScraperJobs).set({ status: 'completed' }).where(eq(imageScraperJobs.JobId, jobId));
    } catch (error) {
      console.error(`[scraper] Job ${jobId} failed`, error);
      await db.update(imageScraperJobs).set({ status: 'failed' }).where(eq(imageScraperJobs.JobId, jobId));
      throw error;
    }
  },
  { connection: connection as ConnectionOptions }
);

export default scrapingImagesWorker;
