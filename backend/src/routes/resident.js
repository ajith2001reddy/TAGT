import express from "express";
import mongoose from "mongoose";

import {
    getAllResidents,
    addResident,
    deleteResident
} from "../controllers/residentController.js";

import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", auth, isAdmin, getAllResidents);

router.post("/", auth, isAdmin, addResident);

router.delete("/:id", auth, isAdmin, async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid resident ID"
        });
    }

    return deleteResident(req, res, next);
});

export default router;
