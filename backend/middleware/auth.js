const jwt = require("jsonwebtoken");

/**
 * Authentication middleware
 * - Verifies JWT token
 * - Attaches user info to req.user
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization token missing"
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        return res.status(500).json({
            success: false,
            message: "Server configuration error"
        });
    }

    try {
        const token = authHeader.slice(7).trim(); // remove "Bearer "

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (err) {
        console.warn("AUTH FAILED:", err.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

module.exports = authMiddleware;
