import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        console.log("HEADER:", req.headers.authorization);
        const token = req.headers.authorization?.split(" ")[1];
        console.log("TOKEN:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED:", decoded);
        const dbUser = await User.findById(decoded.id);

        if (!dbUser) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (!dbUser.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account inactive"
            });
        }

        req.user = dbUser;

        next();

    } catch (error) {
        console.error("auth middleware error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export default auth;