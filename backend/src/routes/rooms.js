import { Router } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { getRoomStats } from "../controllers/v2/roomController.js";
import Room from "../models/rooms.js";

const router = Router();

router.get("/stats", auth, isAdmin, getRoomStats);

router.get("/", async (req, res) => {
    try {
        const rooms = await Room.find({}).lean();
        res.json({ success: true, data: rooms });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/", auth, isAdmin, async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.put("/:id", auth, isAdmin, async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete("/:id", auth, isAdmin, async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Room deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

export default router;
