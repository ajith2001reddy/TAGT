import User from "../../models/User.js";
import Property from "../../models/Property.js";
import generateToken from "../../utils/generateToken.js";

export const registerOwner = async (req, res, next) => {
    try {
        const { name, email, password, propertyName, propertyType, propertyAddress } = req.body;
        if (!name || !email || !password || !propertyName || !propertyType || !propertyAddress) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() }).lean();
        if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

        const owner = new User({ name, email: email.toLowerCase().trim(), password, role: "super_admin" });

        const property = await Property.create({
            name: propertyName,
            type: propertyType,
            owner: owner._id,
            address: propertyAddress
        });

        owner.role = "owner";
        owner.propertyId = property._id;
        await owner.save();

        const token = generateToken(owner);
        return res.status(201).json({ success: true, token, user: { id: owner._id, name: owner.name, email: owner.email, role: owner.role, propertyId: owner.propertyId } });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const ok = await user.comparePassword(password);
        if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });
        if (!user.isActive) return res.status(403).json({ success: false, message: "Account inactive" });

        const token = generateToken(user);
        return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, propertyId: user.propertyId || null } });
    } catch (err) {
        next(err);
    }
};
