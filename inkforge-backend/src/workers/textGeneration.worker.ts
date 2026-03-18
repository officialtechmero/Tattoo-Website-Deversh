import { Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import connection from "../config/redis.config";
import { generateTextForImageIds } from "../services/textGeneration.service";

const textGenerationWorker = new Worker(
  "textGeneration",
  async (job) => {
    const imageIds = Array.isArray(job.data?.imageIds) ? job.data.imageIds : [];
    if (!imageIds.length) {
      return { updated: 0, skipped: 0, failed: 0, failures: [] };
    }

    const result = await generateTextForImageIds(imageIds);
    return result ?? { updated: 0, skipped: 0, failed: imageIds.length, failures: [] };
  },
  { connection: connection as ConnectionOptions }
);

export default textGenerationWorker;
