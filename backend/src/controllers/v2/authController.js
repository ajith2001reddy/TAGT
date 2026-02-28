import User from "../../models/User.js";
import Property from "../../models/Property.js";
import generateToken from "../../utils/generateToken.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import bcrypt from "bcrypt";
console.log("LOGIN HIT");
export const registerOwner = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            propertyName,
            propertyType,
            propertyAddress
        } = req.body;

        if (!name || !email || !password || !propertyName || !propertyType || !propertyAddress) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existing = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Step 1: Create temporary super_admin
        const owner = new User({
            name,
            email: email.toLowerCase().trim(),
            password,
            role: "super_admin",  // bypass validation
            propertyId: null
        });

        await owner.save();

        // Step 2: Create property
        const property = await Property.create({
            name: propertyName,
            type: propertyType,
            owner: owner._id,
            address: propertyAddress
        });

        // Step 3: Convert user to owner properly
        owner.role = "owner";
        owner.propertyId = property._id;
        await owner.save();

        const token = generateToken({
            id: owner._id,
            role: owner.role,
            propertyId: owner.propertyId
        });

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: owner._id,
                name: owner.name,
                email: owner.email,
                role: owner.role,
                propertyId: owner.propertyId
            }
        });

    } catch (err) {
        console.error("REGISTER OWNER ERROR:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const login = async (req, res, next) => {
    try {
        console.log("LOGIN HIT");

        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        }).select("+password");
        console.log("USER FOUND:", user?.email);

        if (!user) {
            console.log("NO USER");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("PASSWORD MATCH:", isMatch);

        if (!isMatch) {
            console.log("PASSWORD WRONG");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        console.log("LOGIN SUCCESS");

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                propertyId: user.propertyId || null
            }
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};      
