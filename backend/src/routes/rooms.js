import { Router } from "express";
import mongoose from "mongoose";

import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { getAllRooms, addRoom, deleteRoom } from "../controllers/roomController.js";

const router = Router();

/**
 * GET ALL ROOMS
 */
router.get("/", auth, isAdmin, getAllRooms);

/**
 * ADD ROOM
 */
router.post("/", auth, isAdmin, addRoom);

/**
 * DELETE ROOM
 */
router.delete("/:id", auth, isAdmin, (req, res, next) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room ID",
        });
    }

    // Direct controller call (clean pattern)
    return deleteRoom(req, res, next);
});

export default router;
