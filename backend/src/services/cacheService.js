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
            return data ? JSON.parse(data) : null;
        } catch (err) {
            logger.error(`Cache Get Error [${key}]:`, { error: err.message });
            return null;
        }
    }

    /**
     * Set data in cache with an expiration time.
     * @param {string} key 
     * @param {any} data 
     * @param {number} ttl - Time to live in seconds (default: 300s / 5m)
     */
    async set(key, data, ttl = 300) {
        try {
            await redis.set(key, JSON.stringify(data), "EX", ttl);
            logger.debug(`Cache Set [${key}] with TTL ${ttl}s`);
        } catch (err) {
            logger.error(`Cache Set Error [${key}]:`, { error: err.message });
        }
    }

    /**
     * Delete a specific cache key.
     * @param {string} key 
     */
    async del(key) {
        try {
            await redis.del(key);
            logger.debug(`Cache Deleted [${key}]`);
        } catch (err) {
            logger.error(`Cache Delete Error [${key}]:`, { error: err.message });
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
