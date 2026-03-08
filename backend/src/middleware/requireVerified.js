/**
 * Middleware to require users to have an approved verification status.
 * Use this to protect routes that require verified users.
 */
export const requireVerified = (req, res, next) => {
    if (!req.user || req.user.role === "super_admin") {
        // Super admins skip verification
        return next();
    }

    if (req.user.verification?.status !== "approved") {
        return res.status(403).json({
            success: false,
            message: "Account verification required. Please complete your identity verification.",
        });
    }

    next();
};
