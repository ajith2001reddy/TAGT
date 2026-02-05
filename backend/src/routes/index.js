import { Router } from "express";

import authRoutes from "./auth.js";
import adminRoutes from "./adminRoutes.js";
import roomRoutes from "./rooms.js";
import paymentRoutes from "./payments.js";
import residentRoutes from "./resident.js";
import analyticsRoutes from "./analytics.js";
import requestRoutes from "./requests.js"; // ✅ NEW

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/rooms", roomRoutes);
router.use("/payments", paymentRoutes);
router.use("/resident", residentRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/requests", requestRoutes); // ✅ NEW

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TAGT API is running",
    });
});

router.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

export default router;
