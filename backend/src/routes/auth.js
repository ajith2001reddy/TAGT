import { Router } from "express";
import admin from "../config/firebase.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const router = Router();

/*
  POST /api/auth/firebase
  Flow:
    1. Frontend logs in via Firebase (email/password or Google)
    2. Gets Firebase ID token: await user.getIdToken()
    3. POSTs { firebaseToken } here
    4. Backend verifies it, finds/creates MongoDB user
    5. Returns our own JWT
    6. Frontend stores JWT, uses it for all API calls
*/
router.post("/firebase", async (req, res, next) => {
    try {
        const { firebaseToken } = req.body;

        if (!firebaseToken) {
            return res.status(400).json({ success: false, message: "Firebase token required" });
        }

        // Verify with Firebase Admin
        let decoded;
        try {
            decoded = await admin.auth().verifyIdToken(firebaseToken);
        } catch {
            return res.status(401).json({ success: false, message: "Invalid Firebase token" });
        }

        const { uid, email, name } = decoded;

        if (!email) {
            return res.status(400).json({ success: false, message: "No email on Firebase account" });
        }

        // Find by firebaseUid OR email (handles pre-existing accounts)
        const scope = buildPropertyFilter(req.user);
        let user = await User.findOne({
            $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }],
            ...scope
        });

        if (user) {
            // Link uid if missing (first Firebase login for existing user)
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
                await user.save();
            }
            if (!user.isActive) {
                return res.status(403).json({ success: false, message: "Account inactive. Contact admin." });
            }
        } else {
            // Brand new user — create in MongoDB
            user = await User.create({
                firebaseUid: uid,
                name: name || email.split("@")[0],
                email: email.toLowerCase(),
                role: "resident",
                isActive: true,
            });
        }

        // Issue our JWT — all existing backend routes stay the same
        const token = generateToken({ id: user._id, role: user.role });

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, roomId: user.roomId },
        });
    } catch (err) {
        next(err);
    }
});

// Keep email/password login for admin accounts that don't use Google
router.post("/login", async (req, res, next) => {
    try {
        const email = req.body.email?.toLowerCase().trim();
        const password = req.body.password?.trim();

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const scope = buildPropertyFilter(req.user);
        const user = await User.findOne({ email, ...scope }).select("+password");

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: "This account uses Google sign-in. Use the Google button instead.",
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken({ id: user._id, role: user.role });

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, roomId: user.roomId },
        });
    } catch (err) {
        next(err);
    }
});

export default router;