const express = require("express");
const auth = require("../middleware/auth");
const Request = require("../models/Request");

const router = express.Router();

/* ===== CREATE REQUEST ===== */
router.post("/request", auth, async (req, res, next) => {
    try {
        const request = await Request.create({
            residentId: req.user.id,
            message: req.body.message
        });

        res.status(201).json(request);
    } catch (err) {
        next(err);
    }
});

/* ===== GET MY REQUESTS ===== */
router.get("/requests", auth, async (req, res, next) => {
    try {
        const requests = await Request.find({
            residentId: req.user.id
        }).sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
