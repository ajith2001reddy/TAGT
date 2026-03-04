import Property from "../models/Property.js";
import User from "../models/User.js";
import admin from "../config/firebase.js";
import mongoose from "mongoose";

/* ===========================
   CREATE PROPERTY
=========================== */
export const createProperty = async (req, res, next) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const { name, type, address, city, gstin, pan, phone } = req.body;

        const property = await Property.create({
            name,
            type,
            address,
            city,
            gstin: gstin || "",
            pan: pan || "",
            phone: phone || "",
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (req.user.role !== "super_admin") {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const { id } = req.params;
        const { ownerId } = req.body;

        const property = await Property.findById(id).session(session);
        if (!property) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        const owner = await User.findById(ownerId).session(session);
        if (!owner || owner.role !== "owner") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Invalid owner" });
        }

        // Step 1: Remove property from old owner (if any)
        if (property.owner && property.owner.toString() !== ownerId) {
            await User.findByIdAndUpdate(
                property.owner,
                { $pull: { propertyIds: property._id } },
                { session }
            );
        }

        // Step 2: Update property's owner
        property.owner = owner._id;
        await property.save({ session });

        // Step 3: Add property to new owner's list
        await User.findByIdAndUpdate(
            owner._id,
            { $addToSet: { propertyIds: property._id } },
            { session }
        );

        await session.commitTransaction();
        res.json({ success: true, message: "Owner assigned successfully" });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

/* ===========================
   LIST OWNERS
=========================== */
export const listOwners = async (req, res, next) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const owners = await User.find({ role: "owner" })
            .select("name email propertyIds createdAt")
            .populate("propertyIds", "name")
            .lean();

        res.json({ success: true, data: owners });
    } catch (err) {
        next(err);
    }
};