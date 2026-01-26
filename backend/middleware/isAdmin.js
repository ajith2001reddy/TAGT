module.exports = (req, res, next) => {
    // req.user is set by auth middleware
    if (!req.user || req.user.role !== "admin") {
        return res.status(401).json("Admin access required");
    }
    next();
};
