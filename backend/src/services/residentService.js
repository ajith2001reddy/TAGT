import BaseService from "./BaseService.js";
import User from "../models/User.js";
import Room from "../models/rooms.js";
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
    async createResidentWorkflow({ name, email, password, roomId, propertyId }, session) {
        const normalizedEmail = email.toLowerCase().trim();

        // 1️⃣ Validate room
        let roomDoc = null;
        if (roomId) {
            roomDoc = await Room.findOne({ _id: roomId, propertyId }).session(session);
            if (!roomDoc) throw new Error("Invalid room selected");
            if (roomDoc.maintenanceMode) throw new Error("Room is under maintenance");
            if (roomDoc.occupiedBeds >= roomDoc.totalBeds) throw new Error("Room is full");
        }

        // 2️⃣ Fetch Property to get the Owner
        const property = await Property.findById(propertyId).session(session);
        if (!property) throw new Error("Property not found");

        // 3️⃣ Create Firebase user
        const firebaseUser = await admin.auth().createUser({
            email: normalizedEmail,
            displayName: name,
            ...(password && password.length >= 6 ? { password } : {}),
        });

        // 4️⃣ Create Mongo user
        const [resident] = await User.create(
            [{
                name,
                email: normalizedEmail,
                firebaseUid: firebaseUser.uid,
                role: "resident",
                propertyId,
                ownerId: property.owner, // 👈 Link to owner
                roomId: roomDoc?._id || null,
                isActive: true
            }],
            { session }
        );

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
    }
}

export default new ResidentService();