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
        return { propertyId: { $in: user.propertyIds } };
    }

    return { resident: user._id, propertyId: user.propertyId };
};