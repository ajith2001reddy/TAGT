import { Router, raw } from "express";
import auth from "../../middleware/auth.js";
import authorize from "../../middleware/authorize.js";
import verifyPropertyAccess from "../../middleware/verifyPropertyAccess.js";
import { login, registerOwner } from "../../controllers/v2/authController.js";
import { listRooms, createRoom, updateRoom, getRoomStats } from "../../controllers/v2/roomController.js";
import { listResidents, createResident, moveResidentRoom, deactivateResident, addResidentNote, sendNotification, getResidentHistory } from "../../controllers/v2/residentController.js";
import { listPayments, createPayment, markPaymentPaid, sendPaymentReminder, downloadInvoice } from "../../controllers/v2/paymentController.js";
import { listRequests, updateRequest, residentCreateRequest } from "../../controllers/v2/requestController.js";
import { ownerDashboardAnalytics, ownerFinancialDashboard, revenueLeakReport, providerOverview as getProviderOverview, platformStats as getPlatformStats, residentDashboard as getResidentDashboard, residentDashboardV2 as getResidentDashboardV2 } from "../../controllers/v2/analyticsController.js";
import { reportMonthlyRevenue, reportOutstanding } from "../../controllers/v2/reportController.js";
import { listProperties as listAllProperties, updatePropertyStatus as patchPropertyStatus, discoverProperties } from "../../controllers/v2/propertiesController.js";
import { runAutomationTickNow, runLateFeeUpdate, runMonthlyRentGeneration } from "../../controllers/v2/automationController.js";
// Phase 2
import { createPaymentSession, stripeWebhook, stripeStatus } from "../../controllers/v2/stripeController.js";
import { getMyPlan, listPlans, upgradePlan, listAllSubscriptions, adminSetPlan } from "../../controllers/v2/subscriptionController.js";
import { listActivityLogs, myActivityLogs } from "../../controllers/v2/activityController.js";
import { listBeds, createBeds, updateBedStatus, assignResidentToBed } from "../../controllers/v2/bedController.js";
// Phase 3
import { getRevenueForecast, getOccupancyTrends, getSmartAlerts, getChurnAnalysis, getIntelligenceSummary } from "../../controllers/v2/intelligenceController.js";

const router = Router();

/* ── Auth ── */
router.post("/auth/login", login);
router.post("/auth/register-owner", registerOwner);

/* ── Super Admin ── */
router.get("/provider/overview", auth, authorize("super_admin"), getProviderOverview);
router.get("/provider/properties", auth, authorize("super_admin"), listAllProperties);
router.patch("/provider/properties/:id/status", auth, authorize("super_admin"), patchPropertyStatus);
router.get("/admin/platform-stats", auth, authorize("super_admin"), getPlatformStats);

/* ── Analytics ── */
router.get("/analytics/owner-dashboard", auth, authorize("super_admin", "owner"), ownerDashboardAnalytics);
router.get("/analytics/financial-dashboard", auth, authorize("super_admin", "owner"), ownerFinancialDashboard);
router.get("/analytics/revenue-leak", auth, authorize("super_admin", "owner"), revenueLeakReport);

/* ── Rooms ── */
router.get("/rooms", auth, authorize("super_admin", "owner"), listRooms);
router.get("/rooms/stats", auth, authorize("super_admin", "owner"), getRoomStats);
router.post("/rooms", auth, authorize("super_admin", "owner"), verifyPropertyAccess, createRoom);
router.put("/rooms/:id", auth, authorize("super_admin", "owner"), updateRoom);

/* ── Beds ── */
router.get("/beds", auth, authorize("super_admin", "owner"), listBeds);
router.post("/beds", auth, authorize("super_admin", "owner"), verifyPropertyAccess, createBeds);
router.patch("/beds/:id/status", auth, authorize("super_admin", "owner"), updateBedStatus);
router.post("/beds/:id/assign", auth, authorize("super_admin", "owner"), assignResidentToBed);

/* ── Residents ── */
router.get("/residents", auth, authorize("super_admin", "owner", "resident"), listResidents);
router.post("/residents", auth, authorize("super_admin", "owner"), verifyPropertyAccess, createResident);
router.patch("/residents/:id/move-room", auth, authorize("super_admin", "owner"), moveResidentRoom);
router.patch("/residents/:id/deactivate", auth, authorize("super_admin", "owner"), deactivateResident);
router.post("/residents/:id/notes", auth, authorize("super_admin", "owner"), addResidentNote);
router.post("/residents/:id/notification", auth, authorize("super_admin", "owner"), sendNotification);
router.get("/residents/:id/history", auth, authorize("super_admin", "owner"), getResidentHistory);

/* ── Payments ── */
router.get("/payments", auth, authorize("super_admin", "owner", "resident"), listPayments);
router.post("/payments", auth, authorize("super_admin", "owner"), verifyPropertyAccess, createPayment);
router.patch("/payments/:id/paid", auth, authorize("super_admin", "owner"), markPaymentPaid);
router.post("/payments/:id/send-reminder", auth, authorize("super_admin", "owner"), sendPaymentReminder);
router.get("/payments/:id/invoice", auth, authorize("super_admin", "owner", "resident"), downloadInvoice);

/* ── Reports (CSV) ── */
router.get("/reports/monthly-revenue.csv", auth, authorize("super_admin", "owner"), reportMonthlyRevenue);
router.get("/reports/outstanding.csv", auth, authorize("super_admin", "owner"), reportOutstanding);

/* ── Requests ── */
router.get("/requests", auth, authorize("super_admin", "owner", "resident"), listRequests);
router.patch("/requests/:id", auth, authorize("super_admin", "owner"), updateRequest);

/* ── Resident ── */
router.get("/resident/dashboard", auth, authorize("resident"), getResidentDashboard);
router.get("/resident/dashboard/v2", auth, authorize("resident"), getResidentDashboardV2);
router.post("/resident/requests", auth, authorize("resident"), residentCreateRequest);

/* ── Automation ── */
router.post("/automation/monthly-rent", auth, authorize("super_admin", "owner"), runMonthlyRentGeneration);
router.post("/automation/late-fees", auth, authorize("super_admin", "owner"), runLateFeeUpdate);
router.post("/automation/tick", auth, authorize("super_admin"), runAutomationTickNow);

/* ── Phase 2: Stripe ── */
router.get("/stripe/status", auth, stripeStatus);
router.post("/stripe/checkout-session", auth, authorize("resident"), createPaymentSession);
// Webhook: must use raw body (registered separately in app.js — see below)
router.post("/stripe/webhook", raw({ type: "application/json" }), stripeWebhook);

/* ── Phase 2: Subscriptions ── */
router.get("/subscription/plans", listPlans);
router.get("/subscription/my-plan", auth, authorize("owner"), getMyPlan);
router.post("/subscription/upgrade", auth, authorize("owner"), upgradePlan);
router.get("/admin/subscriptions", auth, authorize("super_admin"), listAllSubscriptions);
router.patch("/admin/subscriptions/:ownerId", auth, authorize("super_admin"), adminSetPlan);

/* ── Phase 2: Activity Logs ── */
router.get("/admin/activity-logs", auth, authorize("super_admin"), listActivityLogs);
router.get("/owner/activity-logs", auth, authorize("owner"), myActivityLogs);

/* ── Resident Discovery ── */
router.get("/properties/discover", auth, authorize("resident"), discoverProperties);

/* ── Phase 3: Intelligence ── */
router.get("/intelligence/summary", auth, authorize("owner"), getIntelligenceSummary);
router.get("/intelligence/revenue-forecast", auth, authorize("owner"), getRevenueForecast);
router.get("/intelligence/occupancy-trends", auth, authorize("owner"), getOccupancyTrends);
router.get("/intelligence/smart-alerts", auth, authorize("owner"), getSmartAlerts);
router.get("/intelligence/churn-analysis", auth, authorize("owner"), getChurnAnalysis);

export default router;
