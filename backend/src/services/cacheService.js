import redis from "../config/redis.js";
import logger from "../utils/logger.js";

/**
 * Cache Service for Redis-based data persistence.
 * Used for storing expensive KPI calculations and analytics results.
 */
class CacheService {
    /**
     * Get data from cache.
     * @param {string} key 
     * @returns {Promise<any|null>}
     */
    async get(key) {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data);
        } catch (err) {
            logger.error(`[CACHE] Get Error for ${key}:`, { error: err.message });
            return null;
        }
    }

    async set(key, data, ttl = 300) {
        try {
            const stringData = JSON.stringify(data);
            await redis.set(key, stringData, "EX", ttl);
        } catch (err) {
            logger.error(`[CACHE] Set Error for ${key}:`, { error: err.message });
        }
    }

    async del(key) {
        try {
            await redis.del(key);
        } catch (err) {
            logger.error(`[CACHE] Delete Error for ${key}:`, { error: err.message });
        }
    }

    /**
     * Generate a consistent cache key.
     * @param {string} prefix 
     * @param {string} identifier 
     * @returns {string}
     */
    generateKey(prefix, identifier) {
        return `tagt:cache:${prefix}:${identifier}`;
    }
}

export default new CacheService();
