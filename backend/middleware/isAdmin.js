/**
 * ADMIN-ONLY MIDDLEWARE
 * - Must be used AFTER auth.js
 */
module.exports = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access only"
            });
        }

        next();
    } catch (err) {
        console.error("IS ADMIN ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Authorization failed"
        });
    }
};
