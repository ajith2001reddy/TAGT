const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const {
    getAllRooms,
    addRoom,
    deleteRoom
} = require("../controllers/roomController");

const router = express.Router();

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

module.exports = router;
