/**
 * verifyPropertyAccess middleware
 *
 * Reads propertyId from req.body, req.params, or req.query.
 * For owners: verifies they own that property.
 * For super_admin: passes through unconditionally.
 * For residents: passes through (scope is handled per-controller).
 *
 * Usage:
 *   router.post("/rooms", auth, authorize("super_admin","owner"), verifyPropertyAccess, createRoom);
 */
const verifyPropertyAccess = (req, res, next) => {
    // super_admin has global access — skip
    if (req.user.role === "super_admin") return next();

    // Read propertyId from request (body takes precedence, then params, then query)
    let propertyId =
        req.body?.propertyId ||
        req.params?.propertyId ||
        req.query?.propertyId;

    if (!propertyId && req.user.role === "owner" && req.user.propertyIds?.length > 0) {
        propertyId = req.user.propertyIds[0];
        if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
            req.body.propertyId = propertyId.toString();
        }
    }

    // Owners must supply a propertyId and must own it
    if (req.user.role === "owner") {
        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: "propertyId is required",
            });
        }

        const owns = req.user.propertyIds?.some(
            (id) => id.toString() === propertyId.toString()
        );

        if (!owns) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this property",
            });
        }

        // Attach resolved propertyId for downstream controllers
        req.propertyId = propertyId;
        return next();
    }

    // Residents: pass through (controllers scope by req.user.propertyId)
    next();
};

export default verifyPropertyAccess;
