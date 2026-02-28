import { Router } from "express";
import auth from "../../middleware/auth.js";
import { authorize } from "../../middleware/authorize.js";
import { login, registerOwner } from "../../controllers/v2/authController.js";
import {
    providerOverview,
    listProperties,
    updatePropertyStatus,
    ownerOverview,
    ownerRooms,
    updateOwnerRoom,
    ownerResidents,
    ownerPayments,
    markPaymentPaid,
    ownerRequests,
    residentDashboard,
    residentCreateRequest
} from "../../controllers/v2/platformController.js";

const router = Router();

router.post("/auth/login", login);
router.post("/auth/register-owner", registerOwner);

router.get("/provider/overview", auth, authorize("super_admin"), providerOverview);
router.get("/provider/properties", auth, authorize("super_admin"), listProperties);
router.patch("/provider/properties/:id/status", auth, authorize("super_admin"), updatePropertyStatus);

router.get("/owner/overview", auth, authorize("owner"), ownerOverview);
router.get("/owner/rooms", auth, authorize("owner"), ownerRooms);
router.post("/owner/rooms", auth, authorize("owner"), ownerRooms);
router.put("/owner/rooms/:id", auth, authorize("owner"), updateOwnerRoom);
router.get("/owner/residents", auth, authorize("owner"), ownerResidents);
router.post("/owner/residents", auth, authorize("owner"), ownerResidents);
router.get("/owner/payments", auth, authorize("owner"), ownerPayments);
router.post("/owner/payments", auth, authorize("owner"), ownerPayments);
router.patch("/owner/payments/:id/paid", auth, authorize("owner"), markPaymentPaid);
router.get("/owner/requests", auth, authorize("owner"), ownerRequests);
router.patch("/owner/requests/:id", auth, authorize("owner"), ownerRequests);

router.get("/resident/dashboard", auth, authorize("resident"), residentDashboard);
router.post("/resident/requests", auth, authorize("resident"), residentCreateRequest);

export default router;