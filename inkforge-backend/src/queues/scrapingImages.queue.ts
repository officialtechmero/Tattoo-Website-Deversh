import { Queue } from 'bullmq';
import type { ConnectionOptions } from 'bullmq';
import connection from '../config/redis.config';

const scrapingImagesQueue = new Queue(
  'scrapingImages',
  { connection: connection as ConnectionOptions }
);

export default scrapingImagesQueue;