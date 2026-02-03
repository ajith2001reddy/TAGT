import { Router } from "express";

import authRoutes from "./auth.js";
import adminRoutes from "./adminRoutes.js";
import roomRoutes from "./rooms.js";
import paymentRoutes from "./payments.js";
import residentRoutes from "./resident.js";

const router = Router();

/* =========================
   AUTH ROUTES
========================= */
router.use("/auth", authRoutes);

/* =========================
   ADMIN ROUTES
========================= */
router.use("/admin", adminRoutes);

/* =========================
   ROOM ROUTES
========================= */
router.use("/rooms", roomRoutes);

/* =========================
   PAYMENT ROUTES
========================= */
router.use("/payments", paymentRoutes);

/* =========================
   RESIDENT ROUTES
========================= */
router.use("/resident", residentRoutes);

/* =========================
   API ROOT
========================= */
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TAGT API is running"
    });
});

/* =========================
   HEALTH CHECK
========================= */
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

export default router;
