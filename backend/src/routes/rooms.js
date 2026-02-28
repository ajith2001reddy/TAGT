import { Router } from "express";
import mongoose from "mongoose";

import auth from "../middleware/auth.js";
import { getAllRooms, addRoom, updateRoom, deleteRoom } from "../controllers/roomController.js";

const router = Router();

router.get("/", auth, getAllRooms);
router.post("/", auth, addRoom);

router.put("/:id", auth, (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid room ID" });
    }
    return updateRoom(req, res, next);
});

router.delete("/:id", auth, (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid room ID" });
    }
    return deleteRoom(req, res, next);
});

export default router;
