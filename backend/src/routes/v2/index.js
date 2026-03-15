import { Router } from "express";
import auth from "../../middleware/auth.js";
import { dynamicTenantRateLimiter } from "../../middleware/tenantLimiter.js";
import authorize from "../../middleware/authorize.js";
import verifyPropertyAccess from "../../middleware/verifyPropertyAccess.js";
import validate from "../../middleware/validate.js";
import { loginSchema } from "../../validations/auth.validation.js";
import { createRoomSchema, updateRoomSchema } from "../../validations/room.validation.js";
import { createResidentSchema, updateResidentSchema } from "../../validations/resident.validation.js";
import { updatePropertySchema, updatePropertyStatusSchema } from "../../validations/property.validation.js";
import { createPaymentSchema, markPaymentPaidSchema } from "../../validations/payment.validation.js";
import { createTicketSchema, replyToTicketSchema, updateTicketStatusSchema, addInternalNoteSchema } from "../../validations/support.validation.js";
import { createRequestSchema, updateRequestSchema } from "../../validations/request.validation.js";
import { createBedSchema, updateBedStatusSchema, assignBedSchema } from "../../validations/bed.validation.js";
import { updateProfileSchema, changePasswordSchema } from "../../validations/user.validation.js";
import { login, register } from "../../controllers/v2/authController.js";
import { listRooms, createRoom, updateRoom, deleteRoom, getRoomStats } from "../../controllers/v2/roomController.js";
import { listResidents, createResident, moveResidentRoom, deactivateResident, approveResident, addResidentNote, sendNotification, getResidentHistory, assignResidentToProperty, superAdminUpdateResident, downloadLease } from "../../controllers/v2/residentController.js";
import { listPayments, createPayment, markPaymentPaid, sendPaymentReminder, downloadInvoice } from "../../controllers/v2/paymentController.js";
import { listRequests, updateRequest, residentCreateRequest } from "../../controllers/v2/requestController.js";
import { ownerDashboardAnalytics, ownerFinancialDashboard, revenueLeakReport, providerOverview as getProviderOverview, platformStats as getPlatformStats, residentDashboard as getResidentDashboard, residentDashboardV2 as getResidentDashboardV2, ownerDashboardSummary } from "../../controllers/v2/analyticsController.js";
import { 
    reportMonthlyRevenue, 
    reportOutstanding, 
    reportResidentLedger,
    getResidentsReport,
    getRentReport,
    getOccupancyReport,
    getFinancialReport,
    exportResidentsExcel,
    exportPaymentsExcel,
    exportRentReceiptPDF,
    exportExpensesExcel
} from "../../controllers/v2/reportController.js";
import { listProperties as listAllProperties, updatePropertyStatus as patchPropertyStatus, updateProperty, discoverProperties, superAdminUpdateOwner, getMyProperties, createProperty, getPropertyById } from "../../controllers/v2/propertiesController.js";
import { listExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary } from "../../controllers/v2/expenseController.js";
import { runAutomationTickNow, runLateFeeUpdate, runMonthlyRentGeneration } from "../../controllers/v2/automationController.js";
// Phase 2
import { createPaymentSession, createSubscriptionSession, razorpayWebhook, razorpayStatus, verifyPayment } from "../../controllers/v2/razorpayController.js";
import { getMyPlan, listPlans, upgradePlan, listAllSubscriptions, adminSetPlan } from "../../controllers/v2/subscriptionController.js";
import { listActivityLogs, myActivityLogs, logActivity } from "../../controllers/v2/activityController.js";
import { listBeds, createBeds, updateBedStatus, assignResidentToBed } from "../../controllers/v2/bedController.js";
import { getPlatformStats as getPublicPlatformStats } from "../../controllers/v2/publicController.js";
// Phase 3
import { getRevenueForecast, getOccupancyTrends, getSmartAlerts, getChurnAnalysis, getIntelligenceSummary } from "../../controllers/v2/intelligenceController.js";
// Phase 4: Support
import { createTicket, listMyTickets, listAllTickets, getTicket, replyToTicket, updateTicketStatus, addInternalNote } from "../../controllers/v2/supportController.js";
// Phase 5: Notifications
import { getNotifications, getUnreadCount, markRead, markAllRead } from "../../controllers/v2/notificationController.js";
// Phase 6: Broadcast Notices
import { createNotice, listNotices } from "../../controllers/v2/noticeController.js";
// Phase 7: Join Requests
import { createJoinRequest, getPropertyJoinRequests, approveJoinRequest, rejectJoinRequest } from "../../controllers/v2/joinRequestController.js";
// Phase 8: Profile & User Management
import { getProfile, updateProfile, changePassword, superAdminManageUser } from "../../controllers/v2/userController.js";
import { globalSearch } from "../../controllers/v2/searchController.js";
import { getUnifiedLedger } from "../../controllers/v2/ledgerController.js";

// All API V2 routes are under /api/v2
// Currently dynamic limiters are applied individually or globally in app.js

const router = Router();

/* ── Public ── */
router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/register", register);
router.get("/public/platform-stats", getPublicPlatformStats);
router.get("/subscription/plans", listPlans);

/* ── Protected (Session & Rate Limited) ── */
router.use(auth);
router.use(dynamicTenantRateLimiter);

/* ── Super Admin ── */
router.get("/provider/overview", authorize("super_admin"), getProviderOverview);
router.get("/provider/properties", authorize("super_admin"), listAllProperties);
router.put("/provider/properties/:id", authorize("super_admin"), validate(updatePropertySchema), logActivity("PROPERTY_UPDATED"), updateProperty);
router.put("/provider/owners/:id", authorize("super_admin"), logActivity("OWNER_UPDATED_BY_ADMIN"), superAdminUpdateOwner);
router.patch("/provider/properties/:id/status", authorize("super_admin"), validate(updatePropertyStatusSchema), logActivity("PROPERTY_STATUS_CHANGED"), patchPropertyStatus);
router.get("/admin/platform-stats", authorize("super_admin"), getPlatformStats);
router.put("/admin/users/:id", authorize("super_admin"), logActivity("USER_MANAGED_BY_ADMIN"), superAdminManageUser);

// Consolidated from legacy admin.js
import {
    createOwner,
    assignOwnerToProperty,
    listOwners,
    removePropertyFromOwner,
    deleteOwner,
    deleteResident,
    deleteProperty,
    getPendingVerifications,
    approveVerification,
    rejectVerification
} from "../../controllers/adminController.js";

router.get("/admin/owners", authorize("super_admin"), listOwners);
router.post("/admin/owners", authorize("super_admin"), createOwner);
router.post("/admin/properties/:id/assign-owner", authorize("super_admin"), assignOwnerToProperty);
router.delete("/admin/owners/:ownerId/properties/:propertyId", authorize("super_admin"), removePropertyFromOwner);
router.delete("/admin/owners/:id", authorize("super_admin"), deleteOwner);
router.delete("/admin/residents/:id", authorize("super_admin"), deleteResident);
router.delete("/admin/properties/:id", authorize("super_admin"), deleteProperty);
router.get("/admin/verifications/pending", authorize("super_admin"), getPendingVerifications);
router.post("/admin/verifications/:id/approve", authorize("super_admin"), approveVerification);
router.post("/admin/verifications/:id/reject", authorize("super_admin"), rejectVerification);

/* ── Search ── */
router.get("/search", authorize("super_admin", "owner"), globalSearch);

/* ── Analytics ── */
router.get("/analytics/owner-dashboard", authorize("super_admin", "owner"), ownerDashboardAnalytics);
router.get("/analytics/financial-dashboard", authorize("super_admin", "owner"), ownerFinancialDashboard);
router.get("/analytics/revenue-leak", authorize("super_admin", "owner"), revenueLeakReport);
router.get("/analytics/dashboard-summary", authorize("super_admin", "owner"), ownerDashboardSummary);

/* ── Rooms ── */
router.get("/rooms", authorize("super_admin", "owner"), listRooms);
router.get("/rooms/stats", authorize("super_admin", "owner"), getRoomStats);
router.post("/rooms", authorize("super_admin", "owner"), verifyPropertyAccess, validate(createRoomSchema), logActivity("ROOM_CREATED"), createRoom);
router.put("/rooms/:id", authorize("super_admin", "owner"), validate(updateRoomSchema), logActivity("ROOM_UPDATED"), updateRoom);
router.delete("/rooms/:id", authorize("super_admin", "owner"), logActivity("ROOM_DELETED"), deleteRoom);

/* ── Beds ── */
router.get("/beds", authorize("super_admin", "owner"), listBeds);
router.post("/beds", authorize("super_admin", "owner"), verifyPropertyAccess, validate(createBedSchema), createBeds);
router.patch("/beds/:id/status", authorize("super_admin", "owner"), validate(updateBedStatusSchema), updateBedStatus);
router.post("/beds/:id/assign", authorize("super_admin", "owner"), validate(assignBedSchema), assignResidentToBed);

/* ── Residents ── */
router.get("/residents", authorize("super_admin", "owner", "resident"), listResidents);
router.post("/residents", authorize("super_admin", "owner"), verifyPropertyAccess, validate(createResidentSchema), logActivity("RESIDENT_CREATED"), createResident);
router.patch("/residents/:id/move-room", authorize("super_admin", "owner"), logActivity("RESIDENT_RELOCATED"), moveResidentRoom);
router.patch("/residents/:id/deactivate", authorize("super_admin", "owner"), logActivity("RESIDENT_DEACTIVATED"), deactivateResident);
router.patch("/residents/:id/approve", authorize("super_admin", "owner"), logActivity("RESIDENT_APPROVED"), approveResident);
router.post("/residents/:id/notes", authorize("super_admin", "owner"), addResidentNote);
router.post("/residents/:id/notification", authorize("super_admin", "owner"), sendNotification);
router.get("/residents/:id/history", authorize("super_admin", "owner"), getResidentHistory);
router.patch("/residents/:id/assign-property", authorize("super_admin"), logActivity("RESIDENT_PROPERTY_ASSIGNED"), assignResidentToProperty);
router.put("/residents/:id", authorize("super_admin"), validate(updateResidentSchema), logActivity("RESIDENT_UPDATED_BY_ADMIN"), superAdminUpdateResident);

/* ── Payments ── */
router.get("/ledger", authorize("super_admin", "owner"), getUnifiedLedger);
router.get("/payments", authorize("super_admin", "owner", "resident"), listPayments);
router.post("/payments", authorize("super_admin", "owner"), verifyPropertyAccess, validate(createPaymentSchema), logActivity("PAYMENT_CREATED"), createPayment);
router.patch("/payments/:id/paid", authorize("super_admin", "owner"), validate(markPaymentPaidSchema), logActivity("PAYMENT_MANUAL_RECONCILIATION"), markPaymentPaid);
router.post("/payments/:id/send-reminder", authorize("super_admin", "owner"), sendPaymentReminder);
router.get("/payments/:id/invoice", authorize("super_admin", "owner", "resident"), downloadInvoice);

/* ── Expenses ── */
router.get("/expenses", authorize("super_admin", "owner"), listExpenses);
router.get("/expenses/summary", authorize("super_admin", "owner"), getExpenseSummary);
router.post("/expenses", authorize("super_admin", "owner"), verifyPropertyAccess, logActivity("EXPENSE_ADDED"), createExpense);
router.put("/expenses/:id", authorize("super_admin", "owner"), verifyPropertyAccess, logActivity("EXPENSE_UPDATED"), updateExpense);
router.delete("/expenses/:id", authorize("super_admin", "owner"), logActivity("EXPENSE_DELETED"), deleteExpense);

/* ── Reports ── */
// JSON APIs for Dashboards
router.get("/reports/residents", authorize("super_admin", "owner"), getResidentsReport);
router.get("/reports/rent", authorize("super_admin", "owner"), getRentReport);
router.get("/reports/occupancy", authorize("super_admin", "owner"), getOccupancyReport);
router.get("/reports/financial", authorize("super_admin", "owner"), getFinancialReport);

// Exports
router.get("/reports/export/residents", authorize("super_admin", "owner"), exportResidentsExcel);
router.get("/reports/export/payments", authorize("super_admin", "owner"), exportPaymentsExcel);
router.get("/reports/export/expenses", authorize("super_admin", "owner"), exportExpensesExcel);
router.get("/reports/export/receipt/:id", authorize("super_admin", "owner", "resident"), exportRentReceiptPDF);

// Legacy CSV
router.get("/reports/monthly-revenue.csv", authorize("super_admin", "owner"), reportMonthlyRevenue);
router.get("/reports/outstanding.csv", authorize("super_admin", "owner"), reportOutstanding);
router.get("/reports/resident-ledger.csv", authorize("super_admin", "owner"), reportResidentLedger);

/* ── Requests ── */
router.get("/requests", authorize("super_admin", "owner", "resident"), listRequests);
router.patch("/requests/:id", authorize("super_admin", "owner"), validate(updateRequestSchema), updateRequest);
router.get("/requests/join", authorize("owner"), getPropertyJoinRequests);
router.patch("/requests/join/:id/approve", authorize("owner"), approveJoinRequest);
router.patch("/requests/join/:id/reject", authorize("owner"), rejectJoinRequest);

/* ── Resident ── */
router.get("/resident/dashboard", authorize("resident"), getResidentDashboard);
router.get("/resident/dashboard/v2", authorize("resident"), getResidentDashboardV2);
router.post("/resident/requests", authorize("resident"), validate(createRequestSchema), residentCreateRequest);
router.get("/resident/lease", authorize("resident"), downloadLease);
router.post("/join-requests", authorize("resident"), createJoinRequest);

/* ── Automation ── */
router.post("/automation/monthly-rent", authorize("super_admin", "owner"), runMonthlyRentGeneration);
router.post("/automation/late-fees", authorize("super_admin", "owner"), runLateFeeUpdate);
router.post("/automation/tick", authorize("super_admin"), runAutomationTickNow);

/* ── Phase 2: Razorpay ── */
router.get("/razorpay/status", razorpayStatus);
router.post("/razorpay/checkout-session", authorize("resident"), createPaymentSession);
router.post("/razorpay/verify-payment", authorize("resident"), verifyPayment);
router.post("/razorpay/checkout-subscription", authorize("owner"), createSubscriptionSession);
router.get("/subscription/my-plan", authorize("owner"), getMyPlan);
router.post("/subscription/upgrade", authorize("owner"), upgradePlan);
router.get("/admin/subscriptions", authorize("super_admin"), listAllSubscriptions);
router.patch("/admin/subscriptions/:ownerId", authorize("super_admin"), logActivity("SUBSCRIPTION_OVERRIDE"), adminSetPlan);

/* ── Phase 2: Activity Logs ── */
router.get("/admin/activity-logs", authorize("super_admin"), listActivityLogs);
router.get("/owner/activity-logs", authorize("owner"), myActivityLogs);

/* ── Properties ── */
router.get("/properties", getMyProperties);
router.post("/properties", authorize("owner", "super_admin"), createProperty);
router.get("/properties/discover", authorize("resident"), discoverProperties);
router.get("/properties/:id", getPropertyById);

/* ── Phase 3: Intelligence ── */
router.get("/intelligence/summary", authorize("owner"), getIntelligenceSummary);
router.get("/intelligence/revenue-forecast", authorize("owner"), getRevenueForecast);
router.get("/intelligence/occupancy-trends", authorize("owner"), getOccupancyTrends);
router.get("/intelligence/smart-alerts", authorize("owner"), getSmartAlerts);
router.get("/intelligence/churn-analysis", authorize("owner"), getChurnAnalysis);

/* ── Phase 4: Support Tickets ── */
router.post("/support/tickets", authorize("resident", "owner"), validate(createTicketSchema), createTicket);
router.get("/support/tickets", authorize("resident", "owner"), listMyTickets);
router.get("/support/tickets/all", authorize("super_admin"), listAllTickets);
router.get("/support/tickets/:id", getTicket);
router.post("/support/tickets/:id/reply", validate(replyToTicketSchema), replyToTicket);
router.patch("/support/tickets/:id/status", authorize("super_admin"), validate(updateTicketStatusSchema), updateTicketStatus);
router.post("/support/tickets/:id/note", authorize("super_admin"), validate(addInternalNoteSchema), addInternalNote);

/* ── Phase 5: Notifications ── */
router.get("/notifications", getNotifications);
router.get("/notifications/unread-count", getUnreadCount);
router.patch("/notifications/read-all", markAllRead);
router.patch("/notifications/:id/read", markRead);

/* ── Phase 6: Broadcast Notices ── */
router.post("/notices", authorize("super_admin", "owner"), logActivity("NOTICE_BROADCASTED"), createNotice);
router.get("/notices", authorize("super_admin", "owner", "resident"), listNotices);

/* ── Profile & User Management ── */
router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.post("/profile/change-password", validate(changePasswordSchema), changePassword);

import { listLeases, uploadLease, getMyLease, signLease } from "../../controllers/v2/leaseController.js";

/* ── Leases ── */
router.get("/leases", authorize("owner"), listLeases);
router.post("/leases", authorize("owner"), logActivity("LEASE_UPLOADED"), uploadLease);
router.get("/resident/lease/active", authorize("resident"), getMyLease);
router.post("/resident/lease/sign", authorize("resident"), logActivity("LEASE_SIGNED"), signLease);

export default router;
