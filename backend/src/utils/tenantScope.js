export const getPropertyScope = (user) => {
    if (user.role === "super_admin") return {};

    if (user.role === "owner") {
        return { _id: { $in: user.propertyIds } };
    }

    return { _id: user.propertyId };
};

export const buildPropertyFilter = (user) => {
    if (user.role === "super_admin") return {};

    if (user.role === "owner") {
        // If owner has multiple properties
        if (Array.isArray(user.propertyIds) && user.propertyIds.length > 0) {
            return { propertyId: { $in: user.propertyIds } };
        }

        // Fallback to single property
        if (user.propertyId) {
            return { propertyId: user.propertyId };
        }

        return {};
    }

    return { propertyId: user.propertyId };
};