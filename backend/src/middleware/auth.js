import admin from "../config/firebase.js";
import User from "../models/User.js";

const firebaseAuth = async (req, res, next) => {
    let token; // ✅ declare outside

    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        token = header.split(" ")[1]; // assign here

        // 1️⃣ Verify Firebase token
        const decoded = await admin.auth().verifyIdToken(token);

        // 2️⃣ Find user in DB
        const dbUser = await User.findOne({
            $or: [
                { firebaseUid: decoded.uid },
                { email: decoded.email?.toLowerCase() }
            ]
        });

        if (!dbUser) {
            return res.status(401).json({
                success: false,
                message: "User not registered in system"
            });
        }

        if (!dbUser.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account inactive"
            });
        }

        // 3️⃣ Link firebaseUid if missing
        if (!dbUser.firebaseUid) {
            await User.findByIdAndUpdate(dbUser._id, {
                firebaseUid: decoded.uid
            });
        }

        // 4️⃣ Attach user
        req.user = dbUser;

        next();

    } catch (error) {
        console.log("Token received:", token);
        console.error("firebaseAuth error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export default firebaseAuth;