import User from "../../models/User.js";

export const login = async (req, res) => {
    res.json({
        success: true,
        message: "Login handled by Firebase on frontend"
    });
};

export const registerOwner = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email required"
            });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });

        if (existing) {
            return res.json({
                success: true,
                message: "Owner already exists"
            });
        }

        const newOwner = await User.create({
            name,
            email: email.toLowerCase(),
            role: "owner",
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: newOwner
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};