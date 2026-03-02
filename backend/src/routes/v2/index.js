import { Router } from "express";
import auth from "../../middleware/auth.js";
import authorize from "../../middleware/authorize.js";
import { login, registerOwner } from "../../controllers/v2/authController.js";
import {
    listRooms,
    createRoom,
    updateRoom,
    listResidents,
    createResident,
    listPayments,
    createPayment,
    markPaymentPaid,
    sendPaymentReminder,
    listRequests,
    updateRequest,
    residentDashboard,
    residentCreateRequest,
    ownerDashboardAnalytics,
    providerOverview,
    listProperties,
    updatePropertyStatus
} from "../../controllers/v2/platformController.js";
import { runAutomationTickNow, runLateFeeUpdate, runMonthlyRentGeneration } from "../../controllers/v2/automationController.js";

const router = Router();

router.post("/auth/login", login);
router.post("/auth/register-owner", registerOwner);

router.get("/provider/overview", auth, authorize("super_admin"), providerOverview);
router.get("/provider/properties", auth, authorize("super_admin"), listProperties);
router.patch("/provider/properties/:id/status", auth, authorize("super_admin"), updatePropertyStatus);

router.get("/analytics/owner-dashboard", auth, authorize("super_admin", "owner"), ownerDashboardAnalytics);

router.get("/rooms", auth, authorize("super_admin", "owner"), listRooms);
router.post("/rooms", auth, authorize("super_admin", "owner"), createRoom);
router.put("/rooms/:id", auth, authorize("super_admin", "owner"), updateRoom);

router.get("/residents", auth, authorize("super_admin", "owner", "resident"), listResidents);
router.post("/residents", auth, authorize("super_admin", "owner"), createResident);

router.get("/payments", auth, authorize("super_admin", "owner", "resident"), listPayments);
router.post("/payments", auth, authorize("super_admin", "owner"), createPayment);
router.patch("/payments/:id/paid", auth, authorize("super_admin", "owner"), markPaymentPaid);
router.post("/payments/:id/send-reminder", auth, authorize("super_admin", "owner"), sendPaymentReminder);

router.get("/requests", auth, authorize("super_admin", "owner", "resident"), listRequests);
router.patch("/requests/:id", auth, authorize("super_admin", "owner"), updateRequest);
router.get("/resident/dashboard", auth, authorize("resident"), residentDashboard);
router.post("/resident/requests", auth, authorize("resident"), residentCreateRequest);

router.post("/automation/monthly-rent", auth, authorize("super_admin", "owner"), runMonthlyRentGeneration);
router.post("/automation/late-fees", auth, authorize("super_admin", "owner"), runLateFeeUpdate);
router.post("/automation/tick", auth, authorize("super_admin"), runAutomationTickNow);

export default router;
