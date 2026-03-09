import User from '../src/models/User.js';
import Property from '../src/models/Property.js';

/**
 * Creates a mock owner user.
 */
export const createMockOwner = async () => {
    return await User.create({
        name: "Mock Owner",
        email: "mock-owner@example.com",
        role: "owner",
        isActive: true,
        firebaseUid: "mock-owner-uid"
    });
};

export const createOwner = createMockOwner;

/**
 * Creates a mock property for an owner.
 */
export const createMockProperty = async (ownerId) => {
    const property = await Property.create({
        name: "Mock Property",
        type: "pg",
        address: "123 Mock St",
        city: "Mock City",
        ownerId: ownerId,
        isActive: true
    });

    return property;

    return property;
};
