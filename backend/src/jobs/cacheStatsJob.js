import Property from "../models/Property.js";
import { getKPIsInternal } from "../analytics/kpiCalculator.js";
import redis from "../config/redis.js";
import logger from "../utils/logger.js";

/**
 * 4️⃣ Occupancy Statistics Cache
 * Goal: Calculate stats every 5 minutes/periodically and store them in Redis.
 * This improves dashboard speed significantly for the owners.
 */
export async function cacheAllPropertyStats() {
    try {
        const properties = await Property.find({ isActive: true, isDeleted: false });
        logger.info(`[JOB] Caching stats for ${properties.length} properties.`);

        let cachedCount = 0;
        for (const prop of properties) {
            try {
                // Calculate KPIs for this specific property
                // getKPIsInternal takes a scope object
                const scope = { propertyId: prop._id };
                const kpis = await getKPIsInternal(scope);

                // Store in Redis with 10-minute expiry (job runs every 5 mins)
                const cacheKey = `stats:property:${prop._id}`;
                await redis.set(cacheKey, JSON.stringify(kpis), "EX", 600);
                
                cachedCount++;
            } catch (err) {
                logger.error(`[JOB] Failed to cache stats for property ${prop._id}`, { error: err.message });
            }
        }

        logger.info(`[JOB] Stats caching complete. Cached: ${cachedCount}`);
        return cachedCount;
    } catch (err) {
        logger.error("[JOB] Stats caching system error", { error: err.message });
        throw err;
    }
}
