const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    if (!["super_admin", "owner"].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Admin access only"
        });
    }

    next();
};

export default isAdmin;
