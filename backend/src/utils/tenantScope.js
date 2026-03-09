import mongoose from "mongoose";

/**
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

        // For owner-level items like 'Property' itself, we filter by 'ownerId' field
        if (fieldName === "owner" || fieldName === "ownerId") {
            return { ownerId: user._id };
        }

        return { [fieldName]: { $in: allowedIds } };
    }

    // Residents only see their own property
    return { [fieldName]: user.propertyId };
};