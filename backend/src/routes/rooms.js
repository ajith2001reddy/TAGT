import { Router } from "express";

import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

import {
    getAllRooms,
    addRoom,
    deleteRoom
} from "../controllers/roomController.js";

const router = Router();

/* =========================================================
   GET ALL ROOMS (ADMIN)
========================================================= */
router.get("/", auth, isAdmin, getAllRooms);

/* =========================================================
   CREATE ROOM (ADMIN)
========================================================= */
router.post("/", auth, isAdmin, addRoom);

/* =========================================================
   DELETE ROOM (ADMIN)
========================================================= */
router.delete("/:id", auth, isAdmin, deleteRoom);

export default router;
