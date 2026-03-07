import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";
import { Subscription } from "../models/Subscription.js";

/**
 * Tenant-Specific API Rate Limiter
 * Dynamically adjusts rate limits based on the user's subscription tier.
 */
export const dynamicTenantRateLimiter = async (req, res, next) => {
    try {
        // If the user isn't authenticated yet, just pass through to the basic auth/anon limiter
        if (!req.user) {
            return next();
        }

        // We need the ownerId to check the subscription
        let targetOwnerId;
        if (req.user.role === "owner") {
            targetOwnerId = req.user.uid;
        } else if (req.user.role === "resident" && req.user.ownerId) {
            targetOwnerId = req.user.ownerId;
        } else if (req.user.role === "super_admin") {
            // Unrestricted
            return next();
        }

        if (!targetOwnerId) {
            return next();
        }

        // Fetch subscription tier
        const sub = await Subscription.findOne({ owner: targetOwnerId }).lean();
        const tier = sub?.plan || "free";

        let maxRequests;
        if (tier === "pro") {
            maxRequests = 500; // 500 requests per 15 minutes
        } else if (tier === "enterprise") {
            maxRequests = 5000; // High limit
        } else {
            maxRequests = 100; // Strict free limit
        }

        // We create an ephemeral limiter scoped to this specific tenant
        // Notice we do this inside the middleware pipeline.
        // Doing this per-request isn't perfectly optimized.
        // A better approach for massive scale is using Redis for custom stateful counting,
        // but `express-rate-limit` requires static instances.

        // We can use a factory pattern to cache the limiters per ownerId
        let limiter = getLimiterForOwner(targetOwnerId, maxRequests);

        return limiter(req, res, next);
    } catch (err) {
        logger.error("Error in dynamic rate limiter", { error: err.message });
        // Fail open
        return next();
    }
};

// Simple memory cache for rate limiter instances per tenant
const tenantLimiters = new Map();

function getLimiterForOwner(ownerId, limit) {
    if (tenantLimiters.has(ownerId)) {
        return tenantLimiters.get(ownerId);
    }

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: limit,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: () => ownerId, // Scope limit by tenant, not IP
        message: {
            success: false,
            message: `API rate limit exceeded for your subscription tier. Please upgrade.`
        },
    });

    tenantLimiters.set(ownerId, limiter);
    return limiter;
}
