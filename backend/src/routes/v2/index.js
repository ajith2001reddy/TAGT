import { Router, raw } from "express";
import auth from "../../middleware/auth.js";
import authorize from "../../middleware/authorize.js";
import verifyPropertyAccess from "../../middleware/verifyPropertyAccess.js";
import validate from "../../middleware/validate.js";
import { loginSchema, registerOwnerSchema } from "../../validations/auth.validation.js";
import { createRoomSchema, updateRoomSchema } from "../../validations/room.validation.js";
import { login, registerOwner } from "../../controllers/v2/authController.js";
import { listRooms, createRoom, updateRoom, deleteRoom, getRoomStats } from "../../controllers/v2/roomController.js";
import { listResidents, createResident, moveResidentRoom, deactivateResident, addResidentNote, sendNotification, getResidentHistory, assignResidentToProperty, superAdminUpdateResident } from "../../controllers/v2/residentController.js";
import { listPayments, createPayment, markPaymentPaid, sendPaymentReminder, downloadInvoice } from "../../controllers/v2/paymentController.js";
import { listRequests, updateRequest, residentCreateRequest } from "../../controllers/v2/requestController.js";
import { ownerDashboardAnalytics, ownerFinancialDashboard, revenueLeakReport, providerOverview as getProviderOverview, platformStats as getPlatformStats, residentDashboard as getResidentDashboard, residentDashboardV2 as getResidentDashboardV2, ownerDashboardSummary } from "../../controllers/v2/analyticsController.js";
import { reportMonthlyRevenue, reportOutstanding, reportResidentLedger } from "../../controllers/v2/reportController.js";
import { listProperties as listAllProperties, updatePropertyStatus as patchPropertyStatus, updateProperty, discoverProperties, superAdminUpdateOwner } from "../../controllers/v2/propertiesController.js";
import { runAutomationTickNow, runLateFeeUpdate, runMonthlyRentGeneration } from "../../controllers/v2/automationController.js";
// Phase 2
import { createPaymentSession, createSubscriptionSession, stripeWebhook, stripeStatus } from "../../controllers/v2/stripeController.js";
import { getMyPlan, listPlans, upgradePlan, listAllSubscriptions, adminSetPlan } from "../../controllers/v2/subscriptionController.js";
import { listActivityLogs, myActivityLogs, logActivity } from "../../controllers/v2/activityController.js";
import { listBeds, createBeds, updateBedStatus, assignResidentToBed } from "../../controllers/v2/bedController.js";
// Phase 3
import { getRevenueForecast, getOccupancyTrends, getSmartAlerts, getChurnAnalysis, getIntelligenceSummary } from "../../controllers/v2/intelligenceController.js";
// Phase 4: Support
import { createTicket, listMyTickets, listAllTickets, getTicket, replyToTicket, updateTicketStatus, addInternalNote } from "../../controllers/v2/supportController.js";
// Phase 5: Notifications
import { getNotifications, getUnreadCount, markRead, markAllRead } from "../../controllers/v2/notificationController.js";

import { dynamicTenantRateLimiter } from "../../middleware/tenantLimiter.js";

const router = Router();

// Rate limit applies naturally AFTER auth is successful on any protected route.
// We'll slip it into standard chains.

/* ── Auth ── */
router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/register-owner", validate(registerOwnerSchema), registerOwner);

/* ── Super Admin ── */
router.get("/provider/overview", auth, authorize("super_admin"), getProviderOverview);
router.get("/provider/properties", auth, authorize("super_admin"), listAllProperties);
router.put("/provider/properties/:id", auth, authorize("super_admin"), logActivity("PROPERTY_UPDATED"), updateProperty);
router.put("/provider/owners/:id", auth, authorize("super_admin"), logActivity("OWNER_UPDATED_BY_ADMIN"), superAdminUpdateOwner);
router.patch("/provider/properties/:id/status", auth, authorize("super_admin"), logActivity("PROPERTY_STATUS_CHANGED"), patchPropertyStatus);
router.get("/admin/platform-stats", auth, authorize("super_admin"), getPlatformStats);

/* ── Analytics ── */
router.get("/analytics/owner-dashboard", auth, authorize("super_admin", "owner"), ownerDashboardAnalytics);
router.get("/analytics/financial-dashboard", auth, authorize("super_admin", "owner"), ownerFinancialDashboard);
router.get("/analytics/revenue-leak", auth, authorize("super_admin", "owner"), revenueLeakReport);
router.get("/analytics/dashboard-summary", auth, authorize("super_admin", "owner"), ownerDashboardSummary);

/* ── Rooms ── */
router.get("/rooms", auth, authorize("super_admin", "owner"), listRooms);
router.get("/rooms/stats", auth, authorize("super_admin", "owner"), getRoomStats);
router.post("/rooms", auth, authorize("super_admin", "owner"), verifyPropertyAccess, validate(createRoomSchema), createRoom);
router.put("/rooms/:id", auth, authorize("super_admin", "owner"), validate(updateRoomSchema), updateRoom);
router.delete("/rooms/:id", auth, authorize("super_admin", "owner"), deleteRoom);

/* ── Beds ── */
router.get("/beds", auth, authorize("super_admin", "owner"), listBeds);
router.post("/beds", auth, authorize("super_admin", "owner"), verifyPropertyAccess, createBeds);
router.patch("/beds/:id/status", auth, authorize("super_admin", "owner"), updateBedStatus);
router.post("/beds/:id/assign", auth, authorize("super_admin", "owner"), assignResidentToBed);

/* ── Residents ── */
router.get("/residents", auth, authorize("super_admin", "owner", "resident"), listResidents);
router.post("/residents", auth, authorize("super_admin", "owner"), verifyPropertyAccess, createResident);
router.patch("/residents/:id/move-room", auth, authorize("super_admin", "owner"), logActivity("RESIDENT_RELOCATED"), moveResidentRoom);
router.patch("/residents/:id/deactivate", auth, authorize("super_admin", "owner"), logActivity("RESIDENT_DEACTIVATED"), deactivateResident);
router.post("/residents/:id/notes", auth, authorize("super_admin", "owner"), addResidentNote);
router.post("/residents/:id/notification", auth, authorize("super_admin", "owner"), sendNotification);
router.get("/residents/:id/history", auth, authorize("super_admin", "owner"), getResidentHistory);
router.patch("/residents/:id/assign-property", auth, authorize("super_admin"), logActivity("RESIDENT_PROPERTY_ASSIGNED"), assignResidentToProperty);
router.put("/residents/:id", auth, authorize("super_admin"), logActivity("RESIDENT_UPDATED_BY_ADMIN"), superAdminUpdateResident);

/* ── Payments ── */
router.get("/payments", auth, authorize("super_admin", "owner", "resident"), listPayments);
router.post("/payments", auth, authorize("super_admin", "owner"), verifyPropertyAccess, createPayment);
router.patch("/payments/:id/paid", auth, authorize("super_admin", "owner"), logActivity("PAYMENT_MANUAL_RECONCILIATION"), markPaymentPaid);
router.post("/payments/:id/send-reminder", auth, authorize("super_admin", "owner"), sendPaymentReminder);
router.get("/payments/:id/invoice", auth, authorize("super_admin", "owner", "resident"), downloadInvoice);

/* ── Reports (CSV) ── */
router.get("/reports/monthly-revenue.csv", auth, authorize("super_admin", "owner"), reportMonthlyRevenue);
router.get("/reports/outstanding.csv", auth, authorize("super_admin", "owner"), reportOutstanding);
router.get("/reports/resident-ledger.csv", auth, authorize("super_admin", "owner"), reportResidentLedger);

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
router.post("/stripe/checkout-subscription", auth, authorize("owner"), createSubscriptionSession);
// Webhook: must use raw body (registered separately in app.js — see below)
router.post("/stripe/webhook", raw({ type: "application/json" }), stripeWebhook);

/* ── Phase 2: Subscriptions ── */
router.get("/subscription/plans", listPlans);
router.get("/subscription/my-plan", auth, authorize("owner"), getMyPlan);
router.post("/subscription/upgrade", auth, authorize("owner"), upgradePlan);
router.get("/admin/subscriptions", auth, authorize("super_admin"), listAllSubscriptions);
router.patch("/admin/subscriptions/:ownerId", auth, authorize("super_admin"), logActivity("SUBSCRIPTION_OVERRIDE"), adminSetPlan);

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

/* ── Phase 4: Support Tickets ── */
router.post("/support/tickets", auth, authorize("resident", "owner"), createTicket);
router.get("/support/tickets", auth, authorize("resident", "owner"), listMyTickets);
router.get("/support/tickets/all", auth, authorize("super_admin"), listAllTickets);
router.get("/support/tickets/:id", auth, getTicket);
router.post("/support/tickets/:id/reply", auth, replyToTicket);
router.patch("/support/tickets/:id/status", auth, authorize("super_admin"), updateTicketStatus);
router.post("/support/tickets/:id/note", auth, authorize("super_admin"), addInternalNote);

/* ── Phase 5: Notifications ── */
router.get("/notifications", auth, getNotifications);
router.get("/notifications/unread-count", auth, getUnreadCount);
router.patch("/notifications/read-all", auth, markAllRead);
router.patch("/notifications/:id/read", auth, markRead);

export default router;
