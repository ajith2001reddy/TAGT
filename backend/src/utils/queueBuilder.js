import { Queue } from "bullmq";
import IORedis from "ioredis";
import logger from "./logger.js";

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
});

connection.on("error", (err) => {
    logger.error("Redis Connection Error:", { error: err.message });
});

/**
 * Creates and returns a BullMQ Queue instance.
 * @param {string} name - The name of the queue.
 * @returns {Queue}
 */
export const createQueue = (name) => {
    logger.info(`Initializing BullMQ Queue: ${name}`);
    return new Queue(name, {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        }
    });
};

export { connection };
