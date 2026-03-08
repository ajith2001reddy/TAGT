import mongoose from "mongoose";

/**
 */
export const getPropertyScope = (user) => {
    if (user.role === "super_admin") return {};

    if (user.role === "owner") {
        return { _id: { $in: user.propertyIds } };
    }

    return { _id: user.propertyId };
};

/**
 * Returns a filter for scoping resources by propertyId (or owner)
 * @param {Object} user - The user object from req.user
 * @param {string} [requestedPropertyId] - Optional specific property to filter by
 * @param {string} [fieldName] - The field name to use in the filter (default: "propertyId")
 */
export const buildPropertyFilter = (user, requestedPropertyId = null, fieldName = "propertyId") => {
    if (user.role === "super_admin") {
        return requestedPropertyId ? { [fieldName]: requestedPropertyId } : {};
    }

    if (user.role === "owner") {
        const allowedIds = user.propertyIds || [];

        // Block if owner has no properties configured
        if (allowedIds.length === 0) {
            return { [fieldName]: new mongoose.Types.ObjectId() }; // unreachable ID to block all data
        }

        if (requestedPropertyId) {
            const isAllowed = allowedIds.some(id => id.toString() === requestedPropertyId.toString());
            // 🛡️ SECURITY: Hard block if access is attempted to an unowned property
            // ✅ Casting to ObjectId ensures compatibility with aggregate pipelines
            return isAllowed
                ? { [fieldName]: new mongoose.Types.ObjectId(requestedPropertyId) }
                : { [fieldName]: new mongoose.Types.ObjectId() };
        }

        // For owner-level items like 'Property' itself, we filter by 'owner' field
        if (fieldName === "owner") {
            return { owner: user._id };
        }

        return { [fieldName]: { $in: allowedIds } };
    }

    // Residents only see their own property
    return { [fieldName]: user.propertyId };
};