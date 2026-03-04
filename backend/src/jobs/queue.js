import { Queue, Worker } from "bullmq";
import redis from "../config/redis.js";
import logger from "../utils/logger.js";

/**
 * BullMQ Implementation of the Background Task Queue
 * Decouples heavy tasks from the main API process.
 */
const QUEUE_NAME = "main-task-queue";

// 1. Initialize the Queue
export const mainQueue = new Queue(QUEUE_NAME, {
    connection: redis
});

// 2. Initialize the Worker (to process the jobs)
const worker = new Worker(QUEUE_NAME, async (job) => {
    const { name, data } = job;
    logger.info(`[WORKER] Starting job: ${name}`, { jobId: job.id });

    try {
        const startTime = Date.now();

        // We expect the 'job' to pass a function via some registry or match by name
        // However, BullMQ jobs usually pass data. 
        // For our existing scheduler, we were passing functions.
        // We'll adapt this by creating a simple Job Registry.

        if (jobRegistry[name]) {
            await jobRegistry[name](data);
            const duration = Date.now() - startTime;
            logger.info(`[WORKER] Job completed: ${name}`, { duration: `${duration}ms` });
        } else {
            throw new Error(`Job type '${name}' not found in registry`);
        }
    } catch (err) {
        logger.error(`[WORKER] Job failed: ${name}`, { error: err.message, stack: err.stack });
        throw err; // Allow BullMQ to handle retries
    }
}, {
    connection: redis,
    concurrency: 5 // Process 5 jobs at a time
});

// Registry to map job names to their logic functions
const jobRegistry = {};

/**
 * Register a job handler with a specific name.
 * @param {string} name 
 * @param {Function} handler 
 */
export function registerJobHandler(name, handler) {
    jobRegistry[name] = handler;
}

// Global Monitoring
worker.on("completed", (job) => {
    logger.debug(`Job ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
    logger.error(`Job ${job.id} has failed with ${err.message}`);
});
