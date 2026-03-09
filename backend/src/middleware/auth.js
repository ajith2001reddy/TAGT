import admin from "../config/firebase.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import { enforceTenantIsolation } from "./tenantIsolation.js";

const firebaseAuth = async (req, res, next) => {
    let token;

    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            logger.warn("[AUTH] Missing or invalid Authorization header", {
                hasHeader: !!header,
                requestId: req.id
            });
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
                logger.info("[AUTH] Linked Firebase UID", { email: dbUser.email });
            }
        }

        if (!dbUser) {
            return res.status(401).json({
                success: false,
                message: "User not registered in system. Please contact your property manager."
            });
        }

        if (dbUser.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Account suspended. Please contact your property manager."
            });
        }

        // 3️⃣ Attach user
        const userData = dbUser.toObject();
        req.user = userData;

        // 🔐 CTO FIX: Dynamically fetch property IDs for owners 
        // This allows us to remove req.user.propertyIds from the DB
        if (userData.role === "owner") {
            const properties = await Property.find({ ownerId: dbUser._id }, "_id");
            req.user.propertyIds = properties.map(p => p._id);
        }

        req.user._id = dbUser._id; // Ensure ID is present as ObjectId if needed

        // 4️⃣ Enforce multi-tenant database isolation
        enforceTenantIsolation(req, res, next);

    } catch (error) {
        if (token) logger.error("Token check failed", { suffix: token.slice(-10) });
        logger.error("firebaseAuth error", { error: error.message });

        return res.status(401).json({
            success: false,
            message: "Invalid or expired session"
        });
    }
};

export const protect = firebaseAuth;
export default firebaseAuth;