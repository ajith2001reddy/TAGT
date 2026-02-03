/**
 * Admin-only middleware
 * Must be used AFTER auth middleware
 */
const isAdmin = (req, res, next) => {
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
    } catch (error) {
        console.error("❌ IS ADMIN ERROR:", error.message);
        return res.status(500).json({
            success: false,
            message: "Authorization failed"
        });
    }
};

export default isAdmin;
