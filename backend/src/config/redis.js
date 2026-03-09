import process from "process";
import Redis from "ioredis";
import logger from "../utils/logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Obfuscate credentials for logging
const logUrl = REDIS_URL.replace(/:(.*)@/, ":****@");
logger.info(`🔄 Initializing Redis connection to: ${logUrl}`);

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
    connectTimeout: 10000,      // 10 second timeout
    retryStrategy: (times) => {
        // Cap retry attempts
        if (times >= 20) {
            logger.error(`❌ Redis failed after ${times} retries. Stopping.`);
            return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});


redis.on("connect", () => {
    logger.info("📡 Connected to Redis successfully.");
});

redis.on("error", (err) => {
    logger.error("❌ Redis Connection Error:", { error: err.message });
});

export default redis;
