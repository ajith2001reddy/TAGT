import User from "../models/User.js";
import bcrypt from "bcryptjs";

/**
 * GET all residents
 * GET /api/admin/residents
 */
export const getAllResidents = async (req, res) => {
    try {
        const residents = await User.find({ role: "resident" })
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(residents);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch residents" });
    }
};

/**
 * ADD new resident
 * POST /api/admin/residents
 */
export const addResident = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const resident = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "resident"
        });

        res.status(201).json({
            _id: resident._id,
            name: resident.name,
            email: resident.email,
            role: resident.role
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to add resident" });
    }
};
