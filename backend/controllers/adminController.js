const User = require("../models/User");
const Room = require("../models/Room");
const bcrypt = require("bcryptjs");

/* ============================
   GET ALL RESIDENTS (ADMIN)
   ============================ */
exports.getAllResidents = async (req, res) => {
    try {
        const residents = await User.find({
            role: { $regex: /^resident$/i }
        })
            .populate("roomId", "roomNumber")
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
        const { name, email, password, roomId } = req.body;

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

        // ✅ Validate roomId (if provided)
        let room = null;
        if (roomId) {
            room = await Room.findById(roomId);
            if (!room) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid room selected"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const resident = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "resident",
            roomId: room ? room._id : null
        });

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
