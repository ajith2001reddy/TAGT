import express from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import {
    createJoinRequest,
    getPropertyJoinRequests,
    approveJoinRequest,
    rejectJoinRequest
} from "../controllers/v2/joinRequestController.js";

const router = express.Router();

router.use(auth);

// Resident routes
router.post("/", authorize("resident"), createJoinRequest);

// Owner routes
router.get("/owner", authorize("owner", "super_admin"), getPropertyJoinRequests);
router.patch("/:id/approve", authorize("owner", "super_admin"), approveJoinRequest);
router.patch("/:id/reject", authorize("owner", "super_admin"), rejectJoinRequest);

export default router;
