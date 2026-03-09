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
 * Generates a mock token for testing.
 * In a real app, this would be a JWT or Firebase token.
 * For testing with our auth mock, we just return the user object or a signed string.
 */
export const generateMockToken = (user) => {
    // Our firebaseAuth middleware verifies tokens via admin.auth().verifyIdToken(token)
    // In tests, we likely mock admin.auth().verifyIdToken to return the user's UID.
    // So any string will do if the mock is set up.
    return "mock_token_" + (user.firebaseUid || user._id);
};

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
