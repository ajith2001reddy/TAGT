const User = require("../models/User");
const Room = require("../models/Room");
const bcrypt = require("bcryptjs");

/* ============================
   GET ALL RESIDENTS (ADMIN)
============================ */
exports.getAllResidents = async (req, res) => {
    try {
        const residents = await User.find({ role: "resident" })
            .populate("roomId", "roomNumber totalBeds occupiedBeds")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            residents
        });
    } catch (err) {
        console.error("GET RESIDENTS ERROR:", err.message);
        return res.status(500).json({
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

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        let room = null;

        // Validate room & availability
        if (roomId) {
            room = await Room.findById(roomId);

            if (!room) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid room selected"
                });
            }

            if (room.occupiedBeds >= room.totalBeds) {
                return res.status(400).json({
                    success: false,
                    message: "No beds available in this room"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const resident = await User.create({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "resident",
            roomId: room ? room._id : null
        });

        // Increase occupied beds AFTER resident creation
        if (room) {
            room.occupiedBeds += 1;
            await room.save();
        }

        return res.status(201).json({
            success: true,
            resident
        });
    } catch (err) {
        console.error("ADD RESIDENT ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Failed to add resident"
        });
    }
};
