export const getPropertyScope = (user) => {
    if (user.role === "super_admin") return {};
    if (user.role === "owner") return { propertyId: user.propertyId };
    return { _id: user._id };
};

export const buildPropertyFilter = (user) => {
    if (user.role === "super_admin") return {};
    if (user.role === "owner") return { propertyId: user.propertyId };
    return { resident: user._id, propertyId: user.propertyId };
};
