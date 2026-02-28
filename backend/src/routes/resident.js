import express from "express";
import mongoose from "mongoose";

import {
    getAllResidents,
    addResident,
    getResidentProfile,
    updateResident,
    deleteResident
} from "../controllers/residentController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getAllResidents);
router.post("/", auth, addResident);

router.get("/:id", auth, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid resident ID" });
    }
    return getResidentProfile(req, res, next);
});

router.put("/:id", auth, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid resident ID" });
    }
    return updateResident(req, res, next);
});

router.delete("/:id", auth, (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid resident ID" });
    }
    return deleteResident(req, res, next);
});

export default router;
