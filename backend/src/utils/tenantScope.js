/**
 * Returns the filter for querying Property documents
 */
export const getPropertyScope = (user) => {
    if (user.role === "super_admin") return {};

    if (user.role === "owner") {
        return { _id: { $in: user.propertyIds } };
    }

    return { _id: user.propertyId };
};

/**
 * Returns a filter for scoping resources by propertyId
 * @param {Object} user - The user object from req.user
 * @param {string} [requestedPropertyId] - Optional specific property to filter by
 */
export const buildPropertyFilter = (user, requestedPropertyId = null) => {
    if (user.role === "super_admin") {
        return requestedPropertyId ? { propertyId: requestedPropertyId } : {};
    }

    if (user.role === "owner") {
        const allowedIds = user.propertyIds || [];

        // Block if owner has no properties configured
        if (allowedIds.length === 0) {
            return { propertyId: new mongoose.Types.ObjectId() }; // unreachable ID to block all data
        }

        if (requestedPropertyId) {
            const isAllowed = allowedIds.some(id => id.toString() === requestedPropertyId.toString());
            // 🛡️ SECURITY: Hard block if access is attempted to an unowned property
            return isAllowed ? { propertyId: requestedPropertyId } : { propertyId: new mongoose.Types.ObjectId() };
        }

        return { propertyId: { $in: allowedIds } };
    }

    // Residents only see their own property
    return { propertyId: user.propertyId };
};