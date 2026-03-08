// backend/src/routes/index.js
// ──────────────────────────────────────────────────────────────────
// CLEANED: Removed dead v1 route registrations that conflicted with
// /v2 equivalents. The frontend is fully migrated to /v2.
//
// REMOVED (were conflicting with /v2):
//   ❌  /rooms       → replaced by /v2/rooms
//   ❌  /payments    → replaced by /v2/payments
//   ❌  /analytics   → replaced by /v2/analytics/*
//   ❌  /requests    → replaced by /v2/requests
//
// KEPT (still used by frontend or no v2 equivalent yet):
//   ✅  /auth              → login, register
//   ✅  /owner             → /owner/properties (PropertySwitcher), /owner/stats
//   ✅  /admin             → /admin/owners, /admin/properties (provider pages)
//   ✅  /v2                → all v2 routes
//   ✅  /resident          → resident dashboard (payments, requests for resident role)
//   ✅  /enquiries         → public enquiry submission
// ──────────────────────────────────────────────────────────────────

import { Router } from "express";

import authRoutes from "./auth.js";
import ownerRoutes from "./owner.js";
import adminRoutes from "./admin.js";
import v2Routes from "./v2/index.js";
import residentDashboardRoutes from "./residentDashboard.js";
import enquiryRoutes from "./enquiry.routes.js";
import residentProfileRoutes from "./residentProfile.js";
import joinRequestRoutes from "./joinRequestRoutes.js";
import verifyRoutes from "./verify.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/owner", ownerRoutes);
router.use("/admin", adminRoutes);
router.use("/v2/join-requests", joinRequestRoutes);
router.use("/v2", v2Routes);
router.use("/resident", residentDashboardRoutes);
router.use("/resident", residentProfileRoutes);
router.use("/enquiries", enquiryRoutes);
router.use("/verify", verifyRoutes);

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