import admin from "../config/firebase.js";
import User from "../models/User.js";

const firebaseAuth = async (req, res, next) => {
    let token;

    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        token = header.split(" ")[1];

        // 1️⃣ Verify Firebase token
        const decoded = await admin.auth().verifyIdToken(token);

        // 2️⃣ Find user in DB
        // First try by firebaseUid (most secure, immutable)
        let dbUser = await User.findOne({ firebaseUid: decoded.uid });

        // If not found by UID, try by verified email (for pre-registered residents)
        if (!dbUser && decoded.email && decoded.email_verified) {
            dbUser = await User.findOne({ email: decoded.email.toLowerCase() });

            // If found by email, link the UID once
            if (dbUser && !dbUser.firebaseUid) {
                dbUser.firebaseUid = decoded.uid;
                await dbUser.save();
                console.log(`[AUTH] Linked Firebase UID for user: ${dbUser.email}`);
            }
        }

        if (!dbUser) {
            return res.status(401).json({
                success: false,
                message: "User not registered in system. Please contact your property manager."
            });
        }

        if (!dbUser.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account inactive"
            });
        }

        // 3️⃣ Attach user
        req.user = dbUser;

        next();

    } catch (error) {
        if (token) console.log("Token check failed for suffix:", token.slice(-10));
        console.error("firebaseAuth error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired session"
        });
    }
};

export default firebaseAuth;