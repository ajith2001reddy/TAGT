import Property from "../models/Property.js";
import User from "../models/User.js";
import Room from "../models/rooms.js";
import Payment from "../models/Payment.js";
import admin from "../config/firebase.js";
import mongoose from "mongoose";
import { sendOwnerInvite } from "../services/emailService.js";
import logger from "../utils/logger.js";
import Joi from "joi";

/* ===========================
   CREATE PROPERTY
=========================== */
export const createProperty = async (req, res, next) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const schema = Joi.object({
            name: Joi.string().min(2).max(100).required(),
            type: Joi.string().valid("pg", "hostel", "apartment", "other").required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            gstin: Joi.string().allow(""),
            pan: Joi.string().allow(""),
            phone: Joi.string().allow("")
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { name, type, address, city, gstin, pan, phone } = value;

        const property = await Property.create({
            name: String(name).trim(),
            type: String(type),
            address: String(address).trim(),
            city: String(city).trim(),
            gstin: String(gstin || "").trim(),
            pan: String(pan || "").trim(),
            phone: String(phone || "").trim(),
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

        const schema = Joi.object({
            name: Joi.string().min(2).max(100).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).allow("")
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { name, email, password } = value;

        const normalizedEmail = String(email).toLowerCase().trim();

        // 1️⃣ Create Firebase user — set password directly if provided
        const firebaseUser = await admin.auth().createUser({
            email: normalizedEmail,
            displayName: String(name).trim(),
            ...(password && password.length >= 6 ? { password } : {}),
        });

        // 2️⃣ Create Mongo user
        const user = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            role: "owner",
            firebaseUid: String(firebaseUser.uid),
            propertyIds: []
        });

        // 3️⃣ If no password provided, generate a reset link so they can set one via email
        let resetLink = null;
        if (!password || password.length < 6) {
            resetLink = await admin.auth().generatePasswordResetLink(normalizedEmail);
        }

        // 4️⃣ Send Invitation Email (non-blocking)
        sendOwnerInvite({ name, email: normalizedEmail, resetLink });

        res.status(201).json({
            success: true,
            message: password
                ? "Owner created — they can now log in with the provided password"
                : "Owner created and invitation email sent",
            data: user
        });
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
   DELETE OWNER (MongoDB + Firebase)
=========================== */
export const deleteOwner = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const owner = await User.findOne({ _id: id, role: "owner" }).session(session);
        if (!owner) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        // Remove owner reference from all their properties
        if (owner.propertyIds?.length) {
            await Property.updateMany(
                { _id: { $in: owner.propertyIds } },
                { $unset: { owner: "" } },
                { session }
            );
        }

        // Hard delete from MongoDB
        await User.deleteOne({ _id: id }, { session });

        await session.commitTransaction();

        // Delete from Firebase Auth (fire-and-forget, non-blocking)
        if (owner.firebaseUid) {
            admin.auth().deleteUser(owner.firebaseUid)
                .then(() => logger.info(`Firebase user deleted: ${owner.firebaseUid}`))
                .catch(err => logger.warn(`Firebase delete failed for owner ${id}: ${err.message}`));
        }

        res.json({ success: true, message: "Owner deleted from system" });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

/* ===========================
   DELETE RESIDENT (MongoDB + Firebase)
=========================== */
export const deleteResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const resident = await User.findOne({ _id: id, role: "resident" }).session(session);
        if (!resident) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Resident not found" });
        }

        // Free up the bed/room occupancy
        if (resident.roomId) {
            await Room.findByIdAndUpdate(
                resident.roomId,
                { $inc: { occupiedBeds: -1 } },
                { session }
            );
        }

        // Delete all payments for this resident
        await Payment.deleteMany({ resident: id }, { session });

        // Hard delete from MongoDB
        await User.deleteOne({ _id: id }, { session });

        await session.commitTransaction();

        // Delete from Firebase Auth (fire-and-forget)
        if (resident.firebaseUid) {
            admin.auth().deleteUser(resident.firebaseUid)
                .then(() => logger.info(`Firebase user deleted: ${resident.firebaseUid}`))
                .catch(err => logger.warn(`Firebase delete failed for resident ${id}: ${err.message}`));
        }

        res.json({ success: true, message: "Resident deleted from system" });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

/* ===========================
   DELETE PROPERTY (cascade: rooms, beds, payments, owner reference)
=========================== */
export const deleteProperty = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const property = await Property.findById(id).session(session);
        if (!property) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        // 1. Check if any residents are still attached — block if so
        const activeResidents = await User.countDocuments({ propertyId: id, role: "resident" });
        if (activeResidents > 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Cannot delete — ${activeResidents} resident(s) are still assigned to this property`
            });
        }

        // 2. Delete all payments for rooms in this property
        await Payment.deleteMany({ propertyId: id }, { session });

        // 3. Delete all rooms (cascade deletes beds via Room model)
        await Room.deleteMany({ propertyId: id }, { session });

        // 4. Remove property from owner's list
        if (property.owner) {
            await User.findByIdAndUpdate(
                property.owner,
                { $pull: { propertyIds: property._id } },
                { session }
            );
        }

        // 5. Hard delete the property
        await Property.deleteOne({ _id: id }, { session });

        await session.commitTransaction();
        logger.info(`Property ${id} fully deleted with cascade`);
        res.json({ success: true, message: "Property and all associated data deleted" });
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

/* ===========================
   REMOVE PROPERTY FROM OWNER
=========================== */
export const removePropertyFromOwner = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (req.user.role !== "super_admin") {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const { ownerId, propertyId } = req.params;

        // Remove property from owner's list
        await User.findByIdAndUpdate(
            ownerId,
            { $pull: { propertyIds: propertyId } },
            { session }
        );

        // Clear owner reference on the property
        await Property.findByIdAndUpdate(
            propertyId,
            { $unset: { owner: "" } },
            { session }
        );

        await session.commitTransaction();
        res.json({ success: true, message: "Property removed from owner" });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

/* ===========================
   VERIFICATION APPROVAL
=========================== */
export const approveVerification = async (req, res, next) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const { id } = req.params;
        const user = await User.findById(id);

        if (!user || !user.verification) {
            return res.status(404).json({ success: false, message: "User or verification details not found" });
        }

        user.verification.status = "approved";
        await user.save();

        res.json({ success: true, message: "User verification approved" });
    } catch (err) {
        next(err);
    }
};

/* ===========================
   VERIFICATION REJECTION
=========================== */
export const rejectVerification = async (req, res, next) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const { id } = req.params;
        const user = await User.findById(id);

        if (!user || !user.verification) {
            return res.status(404).json({ success: false, message: "User or verification details not found" });
        }

        user.verification.status = "rejected";
        await user.save();

        res.json({ success: true, message: "User verification rejected" });
    } catch (err) {
        next(err);
    }
};

/* ===========================
   GET PENDING VERIFICATIONS
=========================== */
export const getPendingVerifications = async (req, res, next) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ success: false, message: "Super admin only" });
        }

        const users = await User.find({ "verification.status": "pending" })
            .select("name email role verification createdAt")
            .lean();

        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
};
