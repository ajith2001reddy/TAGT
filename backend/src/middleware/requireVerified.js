/**
 * Middleware to require users to have an approved verification status.
 * Use this to protect routes that require verified users.
 */
export const requireVerified = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    // Skip check for super admins
    if (req.user.role === "super_admin") {
        return next();
    }

    // fallback: if an owner is already marked as 'active', treat them as verified
    if (req.user.role === "owner" && req.user.status === "active") {
        return next();
    }

    // allow explicitly approved users
    if (req.user.verification?.status === "approved") {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Account verification required. Please complete identity verification."
    });
};


