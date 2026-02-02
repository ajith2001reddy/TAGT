const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ============================
   GET ALL RESIDENTS (ADMIN)
   ============================ */
exports.getAllResidents = async (req, res) => {
    try {
        // ✅ Case-insensitive role match (fixes empty list issue)
        const residents = await User.find({
            role: { $regex: /^resident$/i }
        })
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
        const { name, email, password, room, rent } = req.body;

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const resident = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "resident", // ✅ always normalized
            room: room || null,
            rent: rent || null
        });

        res.status(201).json({
            success: true,
            resident: {
                _id: resident._id,
                name: resident.name,
                email: resident.email,
                role: resident.role,
                room: resident.room,
                rent: resident.rent
            }
        });
    } catch (err) {
        console.error("ADD RESIDENT ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add resident"
        });
    }
};
