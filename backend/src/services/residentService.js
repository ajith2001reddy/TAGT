import mongoose from "mongoose";
import User from "../models/User.js";
import Room from "../models/rooms.js";
import Payment from "../models/Payment.js";
import Property from "../models/Property.js";
import crypto from "crypto";

/**
 * Core logic for creating a resident, assigning them to a room, and generating their first bill.
 */
export const createResidentWorkflow = async ({ name, email, roomId, propertyId, password: incomingPassword }, session) => {
    const password = incomingPassword || crypto.randomBytes(12).toString("hex");
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Validate & lock room 
    let roomDoc = null;
    if (roomId) {
        roomDoc = await Room.findOne({ _id: roomId, propertyId }).session(session);
        if (!roomDoc) throw new Error("Invalid room selected");
        if (roomDoc.maintenanceMode) throw new Error("Room is under maintenance");
        if (roomDoc.occupiedBeds >= roomDoc.totalBeds) throw new Error("Room is full");
    }

    // 2. Create User
    const [resident] = await User.create(
        [{ name, email: normalizedEmail, password, role: "resident", propertyId, roomId: roomDoc?._id || null, isActive: true }],
        { session }
    );

    // 3. Update room occupancy
    if (roomDoc) {
        roomDoc.occupiedBeds += 1;
        await roomDoc.save({ session });

        // 4. Auto-generate first month's rent bill
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

    return { resident, tempPassword: incomingPassword ? null : password };
};

export const sendWelcomeEmailSafe = async (resident, tempPassword, propertyId) => {
    try {
        const { sendWelcomeEmail } = await import("./emailService.js");
        const propertyDoc = await Property.findById(propertyId).lean();
        await sendWelcomeEmail({
            name: resident.name,
            email: resident.email,
            tempPassword: tempPassword,
            propertyName: propertyDoc?.name || "TAGT",
        });
    } catch (err) {
        console.error("Welcome email failed but resident was created:", err.message);
    }
};
