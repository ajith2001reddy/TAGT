const jwt = require("jsonwebtoken");

/**
 * Generate JWT for authenticated user
 * @param {Object} user - User document
 * @returns {string} JWT token
 */
function generateToken(user) {
    if (!user || !user._id || !user.role) {
        throw new Error("Invalid user data for token generation");
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

module.exports = generateToken;
