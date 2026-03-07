import { Queue } from "bullmq";
import redis from "../config/redis.js";

/**
 * BullMQ Implementation of the Background Task Queue
 * Decouples heavy tasks from the main API process.
 */
const QUEUE_NAME = "main-task-queue";

// 1. Initialize the Queue
export const mainQueue = new Queue(QUEUE_NAME, {
    connection: redis
});

// 2. We no longer initialize the Worker here.
// The worker is now running in a dedicated `src/worker.js` process.
// This prevents the API server from blocking during heavy CRON jobs.
