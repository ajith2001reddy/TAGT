import mongoose from "mongoose";
import BaseService from "./BaseService.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Payment from "../models/Payment.js";
import Property from "../models/Property.js";
import admin from "../config/firebase.js";
import { sendWelcomeEmail } from "./emailService.js";
import logger from "../utils/logger.js";
import eventBus from "../utils/eventBus.js";

class ResidentService extends BaseService {
    constructor() {
        super(User);
    }

    /**
     * Core logic for creating a resident, assigning them to a room,
     * and generating their first bill.
     */
    async createResidentWorkflow(payload, session) {
        const { name, email, password, roomId, propertyId, creatorId } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        // 1️⃣ Validate room
        let roomDoc = null;
        if (roomId) {
            // Coerce to ObjectId to avoid string/ObjectId mismatch in query
            const roomObjId = mongoose.Types.ObjectId.isValid(roomId) ? new mongoose.Types.ObjectId(String(roomId)) : roomId;
            const propObjId = mongoose.Types.ObjectId.isValid(propertyId) ? new mongoose.Types.ObjectId(String(propertyId)) : propertyId;
            roomDoc = await Room.findOne({ _id: roomObjId, propertyId: propObjId }).session(session);
            if (!roomDoc) {
                console.error(`[ResidentService] Room ${roomId} not found in property ${propertyId}. Checking room alone...`);
                const roomAny = await Room.findById(roomObjId).lean();
                console.error(`[ResidentService] Room found without scope?`, roomAny ? JSON.stringify({ _id: roomAny._id, propertyId: roomAny.propertyId }) : "NOT FOUND");
                throw new Error("Invalid room selected");
            }
            if (roomDoc.maintenanceMode) throw new Error("Room is under maintenance");
            if (roomDoc.occupiedBeds >= roomDoc.totalBeds) throw new Error("Room is full");
        }

        // 2️⃣ Fetch Property to get the Owner
        console.log(`[ResidentService] Looking up property: ${propertyId} in DB: ${mongoose.connection.name}`);
        const property = await Property.findById(propertyId).session(session);
        if (!property) {
            const allProps = await Property.find({}).limit(10);
            console.error(`[ResidentService] Property NOT found. Total properties in DB: ${await Property.countDocuments()}. Sample:`, allProps.map(p => p._id));
            throw new Error("Property not found");
        }

        // 3️⃣ Create Firebase user
        const firebaseUser = await admin.auth().createUser({
            email: normalizedEmail,
            displayName: name,
            ...(password && password.length >= 6 ? { password } : {}),
            emailVerified: true // ✅ Mark as verified in Firebase as well
        });

        // 4️⃣ Create Mongo user
        const residentData = {
            ...payload,
            email: normalizedEmail,
            firebaseUid: firebaseUser.uid,
            role: "resident",
            propertyId,
            ownerId: property.ownerId, 
            roomId: roomDoc?._id || null,
            isActive: true,
            emailVerified: true, 
            createdBy: creatorId || property.ownerId,
            updatedBy: creatorId || property.ownerId,
            verification: {
                setupToken: null,
                setupTokenExpires: null
            }
        };

        const [resident] = await User.create([residentData], { session });

        // 4️⃣ Generate password setup link
        let resetLink = null;
        if (!password || password.length < 6) {
            resetLink = await admin.auth().generatePasswordResetLink(normalizedEmail);
            logger.info("Password setup link generated", { link: resetLink });
        }

        // 5️⃣ Update room occupancy
        if (roomDoc) {
            roomDoc.occupiedBeds += 1;
            await roomDoc.save({ session });

            // 6️⃣ Create first rent bill
            await this.ensureMonthlyRentBill(resident._id, roomDoc._id, propertyId, session);
        }

        return { resident, resetLink };
    }

    /**
     * Ensures a resident has a rent bill for the current month.
     * If one exists as "pending", it updates the amount/room.
     * If none exists, it creates a new one.
     */
    async ensureMonthlyRentBill(residentId, roomId, propertyId, session) {
        const room = await Room.findById(roomId).session(session);
        if (!room) throw new Error("Room not found for billing");

        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        const dueDay = 5;
        const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
        if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);

        const rent = room.rent || 0;

        const existingPayment = await Payment.findOne({
            resident: residentId,
            month: currentMonth,
            type: "rent",
            status: "pending"
        }).session(session);

        if (existingPayment) {
            existingPayment.amount = rent;
            existingPayment.totalPayable = rent; // Reset totalPayable if rent changed
            existingPayment.room = roomId;
            existingPayment.propertyId = propertyId;
            await existingPayment.save({ session });
            logger.info("Updated existing pending rent bill", { residentId, month: currentMonth });
        } else {
            await Payment.create([{
                propertyId,
                resident: residentId,
                room: roomId,
                amount: rent,
                totalPayable: rent,
                month: currentMonth,
                type: "rent",
                status: "pending",
                dueDate,
            }], { session });
            logger.info("Created new monthly rent bill", { residentId, month: currentMonth });
        }
    }

    /**
     * Approve a resident and publish an event.
     * @param {string} residentId 
     * @param {string} processedBy 
     * @returns {Promise<Object>}
     */
    async approveResident(residentId, processedBy) {
        const resident = await this.model.findById(residentId);
        if (!resident) throw new Error("Resident not found");

        resident.status = "approved"; // Assuming status field exists or adding it
        await resident.save();

        // Phase 1 uses EventBus (internal EventEmitter)
        // Phase 2 will migrate to BullMQ
        eventBus.publish("resident.approved", {
            residentId,
            propertyId: resident.propertyId,
            processedBy
        });

        return resident;
    }

    /**
     * Safe wrapper for sending welcome email.
     */
    async sendWelcomeEmailSafe(resident, propertyId, resetLink) {
        try {
            console.log(`[ResidentService] sendWelcomeEmailSafe looking up property: ${propertyId}`);
            const propertyDoc = await Property.findById(propertyId).lean();
            if (!propertyDoc) {
                console.error(`[ResidentService] sendWelcomeEmailSafe: Property ${propertyId} NOT FOUND in DB ${mongoose.connection.name}`);
            }
            await sendWelcomeEmail({
                name: resident.name,
                email: resident.email,
                propertyName: propertyDoc?.name || "TAGT",
                resetLink
            });
        } catch (err) {
            logger.error("Welcome email failed but resident was created (safe wrapper)", { error: err.message });
        }
    }
}

export default new ResidentService();