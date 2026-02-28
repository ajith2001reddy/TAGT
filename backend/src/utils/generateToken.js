import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            propertyId: user.propertyId || null,
            roomId: user.roomId || null,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export default generateToken;