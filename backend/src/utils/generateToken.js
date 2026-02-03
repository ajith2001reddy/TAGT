import jwt from "jsonwebtoken";

/**
 * Generate JWT for authenticated user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    if (!user || !user.id || !user.role) {
        throw new Error("Invalid user data for token generation");
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

export default generateToken;
