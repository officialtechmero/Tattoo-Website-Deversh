import { Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import connection from "../config/redis.config";
import { generateTextForImageIds } from "../services/textGeneration.service";
import { db } from "../db/client";
import { textGenerationJobs } from "../db/schema";
import { eq } from "drizzle-orm";

const textGenerationWorker = new Worker(
  "textGeneration",
  async (job) => {
    const imageIds = Array.isArray(job.data?.imageIds) ? job.data.imageIds : [];
    if (!imageIds.length) {
      return { updated: 0, skipped: 0, failed: 0, failures: [] };
    }

    const jobId = Number(job.id);
    if (Number.isFinite(jobId)) {
      await db
        .update(textGenerationJobs)
        .set({ status: "running" })
        .where(eq(textGenerationJobs.JobId, jobId));
    }

    try {
      const result = await generateTextForImageIds(imageIds);
      const summary = result ?? { updated: 0, skipped: 0, failed: imageIds.length, failures: [] };

      if (Number.isFinite(jobId)) {
        await db
          .update(textGenerationJobs)
          .set({
            status: "success",
            updated: summary.updated,
            skipped: summary.skipped,
            failed: summary.failed,
            error_message: summary.failed ? "Some items failed" : null,
          })
          .where(eq(textGenerationJobs.JobId, jobId));
      }

      return summary;
    } catch (error: any) {
      if (Number.isFinite(jobId)) {
        await db
          .update(textGenerationJobs)
          .set({
            status: "failed",
            error_message: typeof error?.message === "string" ? error.message : "Job failed",
          })
          .where(eq(textGenerationJobs.JobId, jobId));
      }
      throw error;
    }
  },
  { connection: connection as ConnectionOptions }
);

export default textGenerationWorker;
