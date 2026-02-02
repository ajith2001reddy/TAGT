const User = require("../models/User");
const rooms = require("../models/rooms");
const bcrypt = require("bcryptjs");

/* ============================
   GET ALL RESIDENTS (ADMIN)
   ============================ */
exports.getAllResidents = async (req, res) => {
    try {
        const residents = await User.find({
            role: { $regex: /^resident$/i }
        })
            .populate("roomsId", "roomsNumber totalBeds occupiedBeds")
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(residents);
    } catch (err) {
        console.error("GET RESIDENTS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch residents"
        });
    }
};

/* ============================
   ADD NEW RESIDENT (ADMIN)
   ============================ */
exports.addResident = async (req, res) => {
    try {
        const { name, email, password, roomsId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        const exists = await User.findOne({
            email: email.toLowerCase()
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        let rooms = null;

        // ✅ Validate rooms & availability
        if (roomsId) {
            rooms = await rooms.findById(roomsId);

            if (!rooms) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid rooms selected"
                });
            }

            if (rooms.occupiedBeds >= rooms.totalBeds) {
                return res.status(400).json({
                    success: false,
                    message: "No beds available in this rooms"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const resident = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "resident",
            roomsId: rooms ? rooms._id : null
        });

        // ✅ Increase occupied beds AFTER resident creation
        if (rooms) {
            rooms.occupiedBeds += 1;
            await rooms.save();
        }

        res.status(201).json({
            success: true,
            resident
        });
    } catch (err) {
        console.error("ADD RESIDENT ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add resident"
        });
    }
};
