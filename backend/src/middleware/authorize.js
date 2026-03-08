import logger from "../utils/logger.js";

/**
 * Enhanced authorization middleware.
 * Supports multiple roles and ensures req.user exists.
 */
const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        logger.warn("[AUTH] Rejected unauthorized access attempt", { path: req.originalUrl });
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
        logger.warn(`[AUTH] Access denied for role: ${req.user.role}`, {
            userId: req.user._id,
            path: req.originalUrl,
            requiredRoles: roles
        });
        return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }

    return next();
};

export default authorize;
