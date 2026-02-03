import { Router } from "express";
import mongoose from "mongoose";

import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

import {
    getAllRooms,
    addRoom,
    deleteRoom
} from "../controllers/roomController.js";

const router = Router();

router.get("/", auth, isAdmin, getAllRooms);

router.post("/", auth, isAdmin, addRoom);

router.delete("/:id", auth, isAdmin, async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room ID"
        });
    }

    return deleteRoom(req, res, next);
});

export default router;
