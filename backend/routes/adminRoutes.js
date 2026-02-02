const express = require("express");
const router = express.Router();

const {
    getAllResidents,
    addResident
} = require("../controllers/adminController");

const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Admin routes
router.get("/residents", auth, isAdmin, getAllResidents);
router.post("/residents", auth, isAdmin, addResident);

module.exports = router;
