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
            targetOwnerId = req.user._id;
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
        const sub = await Subscription.findOne({ ownerId: targetOwnerId }).lean();
        const tier = sub?.plan || "free";

        let limiter = getLimiterForTier(tier);

        return limiter(req, res, next);
    } catch (err) {
        logger.error("Error in dynamic rate limiter", { error: err.message });
        // Fail open
        return next();
    }
};

// Memory cache for rate limiter instances per TIER (not per owner, to prevent leaks)
const tierLimiters = new Map();

function getLimiterForTier(tier) {
    if (tierLimiters.has(tier)) {
        return tierLimiters.get(tier);
    }

    let maxRequests;
    if (tier === "pro") maxRequests = 1000;
    else if (tier === "enterprise") maxRequests = 10000;
    else maxRequests = 100;

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            // Use the ownerId/tenant ID as the key for the rate limit store
            // This ensures each tenant has their own bucket within the same limiter instance
            return req.user?.ownerId || req.user?._id || req.ip;
        },
        skip: (req) => req.user?.role === "super_admin",
        message: {
            success: false,
            message: `API rate limit exceeded for your ${tier} plan. Please upgrade for higher limits.`
        },
    });

    tierLimiters.set(tier, limiter);
    return limiter;
}
