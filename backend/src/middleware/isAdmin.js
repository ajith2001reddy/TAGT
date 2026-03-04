export const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.user.role !== "super_admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};