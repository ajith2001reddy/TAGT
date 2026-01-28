const jwt = require("jsonwebtoken");

/**
 * AUTH MIDDLEWARE
 * - Verifies JWT token
 * - Attaches user info to req.user
 * - Used for ALL protected routes
 */
module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        /**
         * decoded should contain:
         * {
         *   id: user._id,
         *   role: "admin" | "resident"
         * }
         */
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
