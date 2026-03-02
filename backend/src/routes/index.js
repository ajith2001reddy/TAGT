import { Router } from "express";

import authRoutes from "./auth.js";
import ownerRoutes from "./owner.js";
import roomRoutes from "./rooms.js";
import paymentRoutes from "./payments.js";
import residentRoutes from "./resident.js";
import analyticsRoutes from "./analytics.js";
import requestRoutes from "./requests.js";
import v2Routes from "./v2/index.js";
import adminRoutes from "./admin.js";
import residentDashboardRoutes from "./residentDashboard.js";

const router = Router();

router.use("/auth", authRoutes);           // POST /api/auth/login
router.use("/owner", ownerRoutes);
router.use("/admin", adminRoutes);
router.use("/rooms", roomRoutes);
router.use("/payments", paymentRoutes);
router.use("/owner/resident", residentRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/requests", requestRoutes);
router.use("/v2", v2Routes);
router.use("/resident", residentDashboardRoutes);

router.get("/", (req, res) => {
    res.json({ success: true, message: "TAGT API is running" });
});

router.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

export default router;