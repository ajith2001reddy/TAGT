import { Router } from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import admin from "../config/firebase.js";
import logger from "../utils/logger.js";
import { verifyRecaptchaToken } from "../services/recaptchaService.js";

const router = Router();

/**
 * POST /api/auth/verify-recaptcha
 * Verify a reCAPTCHA Enterprise token
 */
router.post("/verify-recaptcha", async (req, res) => {
  try {
    const { token, action } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA token is required"
      });
    }

    const score = await verifyRecaptchaToken(token, action || "LOGIN");

    if (score === null) {
      return res.status(401).json({
        success: false,
        message: "Bot detection failed or was invalid"
      });
    }

    // Return the score to the frontend (frontend can decide what to do, 
    // or we can block here if < 0.5)
    return res.status(200).json({
      success: true,
      data: { score },
      message: "Human verification successful"
    });

  } catch (err) {
    logger.error("reCAPTCHA Verification Error", { error: err.message });
    res.status(500).json({
      success: false,
      message: "Internal security service error"
    });
  }
});

/**
 * GET /api/auth/me
 */
router.get("/me", auth, async (req, res) => {

  // 🚨 Prevent browser caching
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  return res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      propertyId: req.user.propertyId ?? null,
      roomId: req.user.roomId ?? null,
    },
    message: "Authenticated user profile fetched",
  });
});
/**
 * POST /api/auth/register
 * Create Mongo user after Firebase signup
 */
router.post("/register", async (req, res) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const query = [];
    if (decoded.email) query.push({ email: decoded.email.toLowerCase() });
    if (decoded.phone_number) query.push({ phoneNumber: decoded.phone_number });

    const existing = query.length > 0 ? await User.findOne({ $or: query }) : null;

    if (existing) {
      return res.json({
        success: true,
        message: "User already registered",
        data: existing
      });
    }

    const { name, phoneNumber: bodyPhone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const newUser = await User.create({
      firebaseUid: decoded.uid,
      email: decoded.email?.toLowerCase() || null,
      phoneNumber: decoded.phone_number || bodyPhone || null,
      name,
      role: "resident",   // default role
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser
    });

  } catch (err) {
    logger.error("Register error", { error: err.message });

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;