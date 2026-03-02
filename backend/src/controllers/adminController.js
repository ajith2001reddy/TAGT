import Property from "../models/Property.js";
import User from "../models/User.js";
import admin from "../config/firebase.js";

/* ===========================
   CREATE PROPERTY
=========================== */
export const createProperty = async (req, res, next) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const { name, type, address } = req.body;

        const property = await Property.create({
            name,
            type,
            address,
            owner: null
        });

        res.status(201).json({ success: true, data: property });
    } catch (err) {
        next(err);
    }
};

/* ===========================
   CREATE OWNER
=========================== */
export const createOwner = async (req, res, next) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const { name, email, password } = req.body;

        // 1️⃣ Create Firebase user
        const firebaseUser = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });

        // 2️⃣ Create Mongo user
        const user = await User.create({
            name,
            email,
            role: "owner",
            firebaseUid: firebaseUser.uid,
            propertyIds: []
        });

        res.status(201).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

/* ===========================
   ASSIGN OWNER TO PROPERTY
=========================== */
export const assignOwnerToProperty = async (req, res, next) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const { id } = req.params;
        const { ownerId } = req.body;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        const owner = await User.findById(ownerId);
        if (!owner || owner.role !== "owner") {
            return res.status(400).json({ success: false, message: "Invalid owner" });
        }

        // Remove property from old owner if exists
        if (property.owner) {
            await User.findByIdAndUpdate(property.owner, {
                $pull: { propertyIds: property._id }
            });
        }

        // Assign new owner
        property.owner = owner._id;
        await property.save();

        await User.findByIdAndUpdate(owner._id, {
            $addToSet: { propertyIds: property._id }
        });

        res.json({ success: true, message: "Owner assigned successfully" });
    } catch (err) {
        next(err);
    }
};