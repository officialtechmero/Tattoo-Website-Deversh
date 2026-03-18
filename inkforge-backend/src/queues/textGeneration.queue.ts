import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import connection from "../config/redis.config";

const textGenerationQueue = new Queue("textGeneration", {
  connection: connection as ConnectionOptions,
});

export default textGenerationQueue;
