import User from "../models/User.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, firebaseUid } = req.body;

        const existingUser = await User.findOne({ firebaseUid });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            firebaseUid,
            role: "resident",
            isActive: true,
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};