import mongoose from "mongoose";
import User from "../models/User.js";
import Room from "../models/rooms.js";
import Payment from "../models/Payment.js";
import Property from "../models/Property.js";
import admin from "../config/firebase.js";
import { sendWelcomeEmail } from "./emailService.js";
import logger from "../utils/logger.js";

/**
 * Core logic for creating a resident, assigning them to a room,
 * and generating their first bill.
 * Password is NOT set — authentication is handled entirely by Firebase.
 */
export const createResidentWorkflow = async ({ name, email, roomId, propertyId }, session) => {

    const normalizedEmail = email.toLowerCase().trim();

    // 1️⃣ Validate room
    let roomDoc = null;

    if (roomId) {
        roomDoc = await Room.findOne({ _id: roomId, propertyId }).session(session);

        if (!roomDoc) throw new Error("Invalid room selected");
        if (roomDoc.maintenanceMode) throw new Error("Room is under maintenance");
        if (roomDoc.occupiedBeds >= roomDoc.totalBeds) throw new Error("Room is full");
    }

    // 2️⃣ Create Firebase user
    const firebaseUser = await admin.auth().createUser({
        email: normalizedEmail,
        displayName: name,
    });

    // 3️⃣ Create Mongo user
    const [resident] = await User.create(
        [{
            name,
            email: normalizedEmail,
            firebaseUid: firebaseUser.uid,
            role: "resident",
            propertyId,
            roomId: roomDoc?._id || null,
            isActive: true
        }],
        { session }
    );

    // 4️⃣ Generate password setup link
    const resetLink = await admin.auth().generatePasswordResetLink(normalizedEmail);

    logger.info("Password setup link", { link: resetLink });

    // 5️⃣ Send welcome email (if SMTP configured)
    try {

        const propertyDoc = await Property.findById(propertyId).lean();

        await sendWelcomeEmail({
            name,
            email: normalizedEmail,
            propertyName: propertyDoc?.name || "TAGT",
            resetLink
        });

    } catch (err) {

        logger.error("Welcome email failed but resident was created", { error: err.message });

    }

    // 6️⃣ Update room occupancy
    if (roomDoc) {

        roomDoc.occupiedBeds += 1;
        await roomDoc.save({ session });

        // 7️⃣ Create first rent bill
        const now = new Date();

        const currentMonth = now.toISOString().slice(0, 7);

        const dueDay = 5;
        const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);

        if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);

        const rent = roomDoc.rent || 0;

        await Payment.create([{
            propertyId,
            resident: resident._id,
            roomId: roomDoc._id,
            amount: rent,
            totalPayable: rent,
            month: currentMonth,
            type: "rent",
            status: "pending",
            dueDate,
        }], { session });

    }

    return { resident, resetLink };
};


/**
 * Safe wrapper if needed elsewhere
 */
export const sendWelcomeEmailSafe = async (resident, propertyId, resetLink) => {

    try {

        const propertyDoc = await Property.findById(propertyId).lean();

        await sendWelcomeEmail({
            name: resident.name,
            email: resident.email,
            propertyName: propertyDoc?.name || "TAGT",
            resetLink
        });

    } catch (err) {

        logger.error("Welcome email failed but resident was created (safe wrapper)", { error: err.message });

    }

};