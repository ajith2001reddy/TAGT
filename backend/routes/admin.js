const express = require("express");
const Room = require("../models/Room");
const Request = require("../models/Request");
const User = require("../models/User");
const Resident = require("../models/Resident");
const Payment = require("../models/Payment");
const bcrypt = require("bcryptjs");


const router = express.Router();

/* ---------- ROOMS ---------- */

// GET all rooms
router.get("/rooms", async (req, res) => {
    const rooms = await Room.find();
    res.json(rooms);
});

// ADD room
router.post("/rooms", async (req, res) => {
    const room = new Room(req.body);
    await room.save();
    res.json(room);
});

/* ---------- REQUESTS ---------- */

// GET all complaints
router.get("/requests", async (req, res) => {
    const requests = await Request.find();
    res.json(requests);
});

// CLOSE complaint
router.post("/requests/close/:id", async (req, res) => {
    await Request.findByIdAndUpdate(req.params.id, { status: "CLOSED" });
    res.json("Request closed");
});

/* ---------- ADD RESIDENT (WEB UI) ---------- */

router.post("/add-resident", async (req, res) => {
    const { name, email, password, roomNumber, monthlyRent } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
        password: hashedPassword,
        role: "resident"
    });
    await user.save();

    const resident = new Resident({
        userId: user._id,
        name,
        roomNumber,
        monthlyRent
    });
    await resident.save();

    const payment = new Payment({
        residentId: resident._id,
        month: "January",
        status: "DUE"
    });
    await payment.save();

    res.json({ message: "Resident added successfully" });
});


module.exports = router;
