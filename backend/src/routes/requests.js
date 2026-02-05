import { Router } from "express";
import mongoose from "mongoose";

import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

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
router.get("/", auth, isAdmin, getAllRequests);

/**
 * Admin updates request status
 */
router.put("/:id/status", auth, isAdmin, (req, res, next) => {
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
router.delete("/:id", auth, isAdmin, (req, res, next) => {
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
