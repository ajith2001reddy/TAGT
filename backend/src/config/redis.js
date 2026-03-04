import Redis from "ioredis";
import logger from "../utils/logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
    retryStrategy: (times) => {
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
