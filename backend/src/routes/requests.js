import { Router } from "express";
import mongoose from "mongoose";

import auth from "../middleware/auth.js";
import {
    createRequest,
    getAllRequests,
    getMyRequests,
    updateRequestStatus,
    deleteRequest,
} from "../controllers/requestController.js";

const router = Router();

/**
 * Resident creates request
 */
router.post("/", auth, createRequest);

/**
 * Resident views own requests
 */
router.get("/me", auth, getMyRequests);

/**
 * Admin views all requests
 */
router.get("/", auth, getAllRequests);

/**
 * Admin updates request status
 */
router.put("/:id/status", auth, (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid request ID",
        });
    }

    return updateRequestStatus(req, res, next);
});

/**
 * Admin deletes request
 */
router.delete("/:id", auth, (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid request ID",
        });
    }

    return deleteRequest(req, res, next);
});

export default router;
