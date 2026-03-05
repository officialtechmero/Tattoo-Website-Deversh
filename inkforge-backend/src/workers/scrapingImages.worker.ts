import { Worker } from 'bullmq';
import connection from '../config/redis.config';
import type { ConnectionOptions } from 'bullmq';
import scrapePinterest from '../services/scraper.service';
import { db } from '../db/client';
import { imageScraperJobs, scrapeImages } from '../db/schema';
import { eq } from 'drizzle-orm';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const REQUIRED_PINIMG_PREFIX = "https://i.pinimg.com/736x/";
const DOWNLOAD_DIR = path.resolve(process.cwd(), "downloads");
const manifestPathForJob = (jobId: number) => path.join(DOWNLOAD_DIR, `job-${jobId}.json`);

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

const scrapingImagesWorker = new Worker(
  'scrapingImages',
  async (job) => {
    const jobId = Number(job.id);
    if (!Number.isFinite(jobId)) {
      throw new Error(`Invalid BullMQ job id: ${String(job.id)}`);
    }

    try {
      const { query, limit, scrolls } = job.data;

      const results = await scrapePinterest(query, limit, scrolls);
      if(!results?.length) {
        await db.update(imageScraperJobs).set({ status: 'failed' }).where(eq(imageScraperJobs.JobId, jobId));
        return;
      }

      const filteredResults = results.filter((img) => img.src.startsWith(REQUIRED_PINIMG_PREFIX));
      if (!filteredResults.length) {
        await db.update(imageScraperJobs).set({ status: 'failed' }).where(eq(imageScraperJobs.JobId, jobId));
        return;
      }

      await mkdir(DOWNLOAD_DIR, { recursive: true });
      const manifest: Array<{ sourceUrl: string; localPath: string; alt: string; query: string }> = [];
      for (let i = 0; i < filteredResults.length; i++) {
        const image = filteredResults[i];
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

      await db.insert(scrapeImages).values(rows).onConflictDoNothing();
      await writeFile(
        manifestPathForJob(jobId),
        JSON.stringify({ jobId, files: manifest }, null, 2),
        "utf-8"
      );
      await db.update(imageScraperJobs).set({ status: 'ready to upload' }).where(eq(imageScraperJobs.JobId, jobId));
    } catch (error) {
      console.error(`[scraper] Job ${jobId} failed`, error);
      await db.update(imageScraperJobs).set({ status: 'failed' }).where(eq(imageScraperJobs.JobId, jobId));
      throw error;
    }
  },
  { connection: connection as ConnectionOptions }
);

export default scrapingImagesWorker;
