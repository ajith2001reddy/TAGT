import ActivityLog from "../models/ActivityLog.js";
import logger from "../utils/logger.js";

/**
 * Middleware to capture and log all mutating requests (POST, PUT, PATCH, DELETE)
 * for enterprise audit compliance.
 */
export const auditLogger = async (req, res, next) => {
    // Only log mutations
    const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
    if (!mutatingMethods.includes(req.method)) {
        return next();
    }

    // Skip sensitive routes like login
    const skipRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"];
    if (skipRoutes.some(route => req.originalUrl.includes(route))) {
        return next();
    }

    // Capture the original end function to log after response
    const originalEnd = res.end;

    res.end = function (chunk, encoding) {
        res.end = originalEnd;
        res.end(chunk, encoding);

        // Only log successful or client-error mutations (skip 500s usually? or log them too?)
        // Let's log everything that isn't a server crash for full audit capability
        if (req.user) {
            const logEntry = {
                action: `${req.method}_${req.originalUrl.split("/").slice(0, 4).join("_").toUpperCase().replace(/\//g, "")}`,
                performedBy: req.user._id,
                role: req.user.role,
                ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
                route: req.originalUrl,
                propertyId: req.user.propertyId || (req.user.propertyIds?.[0]) || null,
                details: {
                    body: maskSensitiveData(req.body),
                    params: req.params,
                    query: req.query,
                    statusCode: res.statusCode
                }
            };

            ActivityLog.create(logEntry).catch(err => {
                logger.error("[AUDIT] Failed to create activity log:", { error: err.message });
            });
        }
    };

    next();
};

/**
 * Basic helper to mask sensitive fields in audit logs
 */
function maskSensitiveData(data) {
    if (!data) return data;
    const masked = { ...data };
    const sensitiveFields = ["password", "token", "secret", "cvv", "cardNumber"];

    for (const field of sensitiveFields) {
        if (masked[field]) masked[field] = "********";
    }

    return masked;
}
