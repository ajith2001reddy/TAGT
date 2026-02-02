const jwt = require("jsonwebtoken");

/**
 * AUTH MIDDLEWARE
 * - Verifies JWT token
 * - Attaches user info to req.user
 */
module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (err) {
        console.error("AUTH ERROR:", err);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
