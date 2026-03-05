import { db } from "../db/client";
import { imageScraperJobs, scrapeImages } from "../db/schema";
import { and, asc, eq } from "drizzle-orm";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

type ManifestFile = {
  sourceUrl: string;
  localPath: string;
  alt: string;
  query: string;
};

type JobManifest = {
  jobId: number;
  files: ManifestFile[];
};

const POLL_INTERVAL_MS = 10000;
const DOWNLOAD_DIR = path.resolve(process.cwd(), "downloads");
const manifestPathForJob = (jobId: number) => path.join(DOWNLOAD_DIR, `job-${jobId}.json`);

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE ?? "";
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD ?? "";
const BUNNY_STORAGE_REGION = process.env.BUNNY_STORAGE_REGION ?? "";
const BUNNY_PUBLIC_BASE_URL = process.env.BUNNY_PUBLIC_BASE_URL ?? "";

const getStorageHost = () => {
  const region = BUNNY_STORAGE_REGION.trim().toLowerCase();
  return region ? `${region}.storage.bunnycdn.com` : "storage.bunnycdn.com";
};

const hasBunnyConfig = () => {
  return Boolean(BUNNY_STORAGE_ZONE && BUNNY_STORAGE_PASSWORD && BUNNY_PUBLIC_BASE_URL);
};

const sanitizeBunnySegment = (value: string): string => {
  const normalized = value
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
    .slice(0, 80);

  return normalized || "image";
};

const stripPinterestNoise = (value: string): string => {
  return value
    .replace(/^this may contain:\s*/i, "")
    .replace(/^this contains an image of[:\s]*/i, "")
    .replace(/^this contains[:\s]*/i, "")
    .trim();
};

const buildSafeRemotePath = (localPath: string, alt: string): string => {
  const parsed = path.parse(localPath);
  const cleanedAlt = stripPinterestNoise(alt);
  const altSlug = sanitizeBunnySegment(cleanedAlt);
  const uuid = randomUUID();
  const ext = sanitizeBunnySegment(parsed.ext.replace(".", "")) || "jpg";
  return `${altSlug}-${uuid}.${ext}`;
};

const encodeObjectPath = (objectPath: string): string => {
  return objectPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
};

const uploadToBunny = async (localPath: string, remoteObjectPath: string): Promise<string> => {
  const bytes = await readFile(localPath);
  const remotePath = remoteObjectPath.replace(/^\/+/, "");
  const encodedRemotePath = encodeObjectPath(remotePath);
  const url = `https://${getStorageHost()}/${BUNNY_STORAGE_ZONE}/${encodedRemotePath}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: BUNNY_STORAGE_PASSWORD,
      "Content-Type": "application/octet-stream",
    },
    body: bytes,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Bunny upload failed (${response.status}): ${body}`);
  }

  const publicBase = BUNNY_PUBLIC_BASE_URL.replace(/\/+$/, "");
  return `${publicBase}/${encodedRemotePath}`;
};

const readManifest = async (jobId: number): Promise<JobManifest | null> => {
  try {
    const raw = await readFile(manifestPathForJob(jobId), "utf-8");
    return JSON.parse(raw) as JobManifest;
  } catch {
    return null;
  }
};

const processReadyJob = async (jobId: number) => {
  const claimed = await db
    .update(imageScraperJobs)
    .set({ status: "processing" })
    .where(and(eq(imageScraperJobs.JobId, jobId), eq(imageScraperJobs.status, "ready to upload")))
    .returning({ JobId: imageScraperJobs.JobId });

  if (!claimed.length) return;

  try {
    const manifest = await readManifest(jobId);
    if (!manifest || !manifest.files?.length) {
      throw new Error("Missing or empty upload manifest");
    }

    for (let i = 0; i < manifest.files.length; i++) {
      const file = manifest.files[i];
      const remotePath = buildSafeRemotePath(file.localPath, file.alt);
      const publicUrl = await uploadToBunny(file.localPath, remotePath);

      await db
        .update(scrapeImages)
        .set({ imageLink: publicUrl })
        .where(eq(scrapeImages.imageLink, file.sourceUrl));

      // Remove local file after successful upload + backlink update.
      await unlink(file.localPath).catch(() => undefined);
    }

    await db.update(imageScraperJobs).set({ status: "completed" }).where(eq(imageScraperJobs.JobId, jobId));
    await unlink(manifestPathForJob(jobId)).catch(() => undefined);
  } catch (error) {
    console.error(`[bunny] Upload failed for job ${jobId}`, error);
    await db.update(imageScraperJobs).set({ status: "failed" }).where(eq(imageScraperJobs.JobId, jobId));
  }
};

const processReadyJobs = async () => {
  if (!hasBunnyConfig()) return;

  const jobs = await db
    .select({ JobId: imageScraperJobs.JobId })
    .from(imageScraperJobs)
    .where(eq(imageScraperJobs.status, "ready to upload"))
    .orderBy(asc(imageScraperJobs.created_at))
    .limit(3);

  for (const job of jobs) {
    await processReadyJob(job.JobId);
  }
};

let uploadLoopRunning = false;
export const startBunnyUploadService = () => {
  if (uploadLoopRunning) return;
  uploadLoopRunning = true;

  if (!hasBunnyConfig()) {
    console.warn(
      "[bunny] Service disabled. Set BUNNY_STORAGE_ZONE, BUNNY_STORAGE_PASSWORD, and BUNNY_PUBLIC_BASE_URL."
    );
    return;
  }

  void processReadyJobs();
  setInterval(() => {
    void processReadyJobs();
  }, POLL_INTERVAL_MS);
};
