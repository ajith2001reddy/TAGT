import { Router } from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { getAllRooms, addRoom, deleteRoom } from "../controllers/roomController.js";

const router = Router();

// Get all rooms
router.get("/", auth, isAdmin, getAllRooms);

// Add new room
router.post("/", auth, isAdmin, addRoom);

// Delete room by ID
router.delete("/:id", auth, isAdmin, async (req, res, next) => {
    const { id } = req.params;

    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room ID"
        });
    }

    try {
        // Call the controller function to delete the room
        await deleteRoom(req, res, next);  // Pass the request, response, and next function
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
});

export default router;
