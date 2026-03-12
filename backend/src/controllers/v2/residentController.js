import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import User from "../../models/User.js";
import Payment from "../../models/Payment.js";
import Room from "../../models/Room.js";
import Bed from "../../models/Bed.js";
import Property from "../../models/Property.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import residentService from "../../services/residentService.js";
import admin from "../../config/firebase.js";
import logger from "../../utils/logger.js";

/**
 * List residents for a property
 */
export const listResidents = async (req, res) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const query = req.user.role === "super_admin" ? {} : scope;
        const filter = req.user.role === "resident"
            ? { _id: req.user._id }
            : { role: "resident", ...query };

        const residents = await User.find(filter)
            .populate("roomId", "roomNumber rent")
            .populate("propertyId", "name images heroImage")
            .lean();

        return res.json({ success: true, data: residents });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Super Admin: Assign a resident to a property (and optionally a room)
 * Used as an emergency access fix tool
 */
export const assignResidentToProperty = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { propertyId, roomId } = req.body;

        if (!propertyId) {
            return res.status(400).json({ success: false, message: "propertyId is required" });
        }

        const updates = {
            propertyId,
            status: "active",
            ...(roomId ? { roomId } : {}),
        };

        const resident = await User.findOneAndUpdate(
            { _id: id, role: "resident" },
            updates,
            { new: true }
        ).populate("propertyId", "name").populate("roomId", "roomNumber");

        if (!resident) {
            return res.status(404).json({ success: false, message: "Resident not found" });
        }

        // If a room was assigned, update its occupied bed count
        if (roomId) {
            await Room.findByIdAndUpdate(roomId, { $inc: { occupiedBeds: 1 } });
        }

        return res.json({ success: true, data: resident });
    } catch (err) {
        next(err);
    }
};

/**
 * Super Admin: Full edit of any resident's details
 * Can change name, email, phone, status, property, room, bed
 */
export const superAdminUpdateResident = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, status, propertyId, roomId, bedId, isActive } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email.toLowerCase().trim();
        if (phone !== undefined) updates.phone = phone;
        if (status !== undefined) updates.status = status;
        if (isActive !== undefined) updates.isActive = isActive;
        if (propertyId !== undefined) updates.propertyId = propertyId || null;
        if (roomId !== undefined) updates.roomId = roomId || null;
        if (bedId !== undefined) updates.bedId = bedId || null;

        const resident = await User.findOneAndUpdate(
            { _id: id, role: "resident" },
            updates,
            { new: true, runValidators: true }
        )
            .populate("propertyId", "name")
            .populate("roomId", "roomNumber");

        if (!resident) {
            return res.status(404).json({ success: false, message: "Resident not found" });
        }

        // ✅ If room was updated, also update the pending rent payment
        if (roomId) {
            const newRoom = await Room.findById(roomId);
            if (newRoom) {
                const currentMonth = new Date().toISOString().slice(0, 7);
                const pendingPayment = await Payment.findOne({
                    resident: resident._id,
                    month: currentMonth,
                    status: "pending",
                    type: "rent"
                });
                if (updates.roomId && updates.propertyId) {
                    await residentService.ensureMonthlyRentBill(resident._id, updates.roomId, updates.propertyId, session);
                }
            }
        }

        return res.json({ success: true, data: resident });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Email already in use by another user" });
        }
        next(err);
    }
};

/**
 * Create a new resident using the service workflow
 */
export const createResident = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const propertyId = req.body.propertyId || req.user.propertyId;
        if (!propertyId) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "propertyId is required" });
        }

        // 🔐 SECURITY: Ensure owner owns this property
        if (req.user.role === "owner") {
            // 1. Verification Gate
            if (req.user.verification?.status !== "approved") {
                await session.abortTransaction();
                return res.status(403).json({
                    success: false,
                    message: "Your account is not yet verified. Please upload your identity and property documents for verification."
                });
            }

            // 2. Property Access Check
            if (!req.user.propertyIds?.some(id => id.toString() === propertyId.toString())) {
                await session.abortTransaction();
                return res.status(403).json({ success: false, message: "Unauthorized property access" });
            }
        }

        const { resident, resetLink } = await residentService.createResidentWorkflow({
            ...req.body,
            propertyId
        }, session);

        await session.commitTransaction();

        // Async welcome email (fire-and-forget)
        residentService.sendWelcomeEmailSafe(resident, propertyId, resetLink);

        return res.status(201).json({ success: true, data: resident });
    } catch (err) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: err.message });
    } finally {
        session.endSession();
    }
};

/**
 * Move resident to a different room
 */
export const moveResidentRoom = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { newRoomId } = req.body;
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const resident = await User.findOne({ _id: id, role: "resident", ...pm }).session(session);
        if (!resident) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Resident not found" });
        }

        if (resident.roomId) {
            await Room.findByIdAndUpdate(resident.roomId, { $inc: { occupiedBeds: -1 } }).session(session);
        }

        // Also clear out their actual Bed assignment from the old room
        if (resident.bedId) {
            await Bed.findByIdAndUpdate(resident.bedId, { status: "available", residentId: null }, { session });
            resident.bedId = null; // Unassign bed
        }

        const newRoom = await Room.findOne({ _id: newRoomId, ...pm }).session(session);
        if (!newRoom) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Target room not found" });
        }

        if (newRoom.occupiedBeds >= newRoom.totalBeds) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Target room is full" });
        }

        newRoom.occupiedBeds += 1;
        await newRoom.save({ session });

        resident.roomId = newRoom._id;
        await resident.save({ session });

        // ✅ Ensure current month's rent bill exists and is updated
        await residentService.ensureMonthlyRentBill(resident._id, newRoom._id, resident.propertyId, session);

        await session.commitTransaction();
        return res.json({ success: true, data: resident });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

/**
 * Deactivate a resident (checkout)
 */
export const deactivateResident = async (req, res, next) => {
    try {
        const { id } = req.params;
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const resident = await User.findOne({ _id: id, role: "resident", ...pm });
        if (!resident) return res.status(404).json({ success: false, message: "Resident not found" });

        const oldRoomId = resident.roomId;
        const oldBedId = resident.bedId;

        resident.isActive = false;
        resident.roomId = null;
        resident.bedId = null;
        await resident.save();

        if (oldRoomId) {
            await Room.findByIdAndUpdate(oldRoomId, { $inc: { occupiedBeds: -1 } });
        }

        if (oldBedId) {
            await Bed.findByIdAndUpdate(oldBedId, { status: "available", residentId: null });
        }

        return res.json({ success: true, data: resident });
    } catch (err) {
        next(err);
    }
};

/**
 * Approve a resident (Step in Phase 1)
 */
export const approveResident = async (req, res, next) => {
    try {
        const { id } = req.params;
        const resident = await residentService.approveResident(id, req.user._id);
        return res.json({ success: true, data: resident });
    } catch (err) {
        next(err);
    }
};

/**
 * Add a note to a resident's profile
 */
export const addResidentNote = async (req, res) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};
        const { note } = req.body;

        if (!note?.trim()) return res.status(400).json({ success: false, message: "note is required" });

        const resident = await User.findOneAndUpdate(
            { _id: req.params.id, role: "resident", ...pm },
            { $push: { notes: { text: note.trim(), addedBy: req.user._id, addedAt: new Date() } } },
            { new: true }
        );

        if (!resident) return res.status(404).json({ success: false, message: "Resident not found" });
        return res.json({ success: true, data: resident.notes });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Send a notification to a resident
 */
export const sendNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, message } = req.body;
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};

        if (!message?.trim()) return res.status(400).json({ success: false, message: "message is required" });

        const resident = await User.findOneAndUpdate(
            { _id: id, role: "resident", ...pm },
            {
                $push: {
                    notifications: {
                        type: type || "info",
                        message: message.trim(),
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!resident) return res.status(404).json({ success: false, message: "Resident not found" });

        return res.json({ success: true, message: "Notification sent successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getResidentHistory = async (req, res) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};
        const { id } = req.params;

        const resident = await User.findOne({ _id: id, role: "resident", ...pm }, "name email roomId propertyId")
            .populate("roomId", "roomNumber rent")
            .populate("propertyId", "name address images heroImage")
            .lean();

        if (!resident) return res.status(404).json({ success: false, message: "Resident not found" });

        const payments = await Payment.find({ resident: id, ...pm })
            .sort({ month: -1 })
            .lean();

        return res.json({ success: true, data: { resident, payments } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Delete a resident (Soft Delete + Tenant Isolation)
 */
export const deleteResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};

        // Find resident within owner's scope
        const resident = await User.findOne({ _id: id, role: "resident", ...pm }).session(session);
        if (!resident) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Resident not found or unauthorized" });
        }

        const oldRoomId = resident.roomId;
        const oldBedId = resident.bedId;

        // Perform Soft Delete
        resident.isDeleted = true;
        resident.deletedAt = new Date();
        resident.status = "inactive";
        resident.isActive = false;
        resident.roomId = null;
        resident.bedId = null;
        await resident.save({ session });

        // Cleanup Room occupancy
        if (oldRoomId) {
            await Room.findByIdAndUpdate(oldRoomId, { $inc: { occupiedBeds: -1 } }).session(session);
        }

        // Cleanup Bed assignment
        if (oldBedId) {
            await Bed.findByIdAndUpdate(oldBedId, { status: "available", residentId: null }).session(session);
        }

        await session.commitTransaction();

        // Delete from Firebase Auth (non-blocking)
        if (resident.firebaseUid) {
            admin.auth().deleteUser(resident.firebaseUid)
                .then(() => logger.info(`Firebase user deleted for soft-deleted resident: ${resident.firebaseUid}`))
                .catch(err => logger.warn(`Firebase delete failed for resident ${id}: ${err.message}`));
        }

        return res.json({ success: true, message: "Resident deleted successfully (soft-delete)" });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

/**
 * Generate and stream a PDF lease agreement for the logged-in resident
 */
export const downloadLease = async (req, res, next) => {
    try {
        const resident = await User.findById(req.user._id)
            .populate("propertyId", "name address")
            .populate("roomId", "roomNumber rent")
            .lean();

        if (!resident) {
            return res.status(404).json({ success: false, message: "Resident not found" });
        }

        const propertyName = resident.propertyId?.name || "N/A";
        const propertyAddress = resident.propertyId?.address || "";
        const roomNumber = resident.roomId?.roomNumber || "N/A";
        const rent = resident.roomId?.rent || resident.rent || 0;
        const deposit = resident.securityDeposit || rent * 2;
        const leaseStart = resident.leaseStart ? new Date(resident.leaseStart).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "Dec 01, 2025";
        const leaseEnd = resident.leaseEnd ? new Date(resident.leaseEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "Nov 30, 2026";

        const doc = new PDFDocument({ margin: 50, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=lease-agreement-${resident.name?.replace(/\s+/g, "-") || "resident"}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(22).font("Helvetica-Bold").fillColor("#1a1a2e").text("TAGT Property Management", { align: "center" });
        doc.fontSize(12).font("Helvetica").fillColor("#666").text("Residential Lease Agreement", { align: "center" });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#00d4ff").lineWidth(2).stroke();
        doc.moveDown(1);

        // Section: Parties
        doc.fontSize(14).font("Helvetica-Bold").fillColor("#1a1a2e").text("1. PARTIES");
        doc.moveDown(0.4);
        doc.fontSize(11).font("Helvetica").fillColor("#333");
        doc.text(`Resident Name:        ${resident.name || "N/A"}`);
        doc.text(`Email:                ${resident.email || "N/A"}`);
        doc.text(`Phone:                ${resident.phone || "N/A"}`);
        doc.moveDown(0.5);

        // Section: Property
        doc.fontSize(14).font("Helvetica-Bold").fillColor("#1a1a2e").text("2. PROPERTY");
        doc.moveDown(0.4);
        doc.fontSize(11).font("Helvetica").fillColor("#333");
        doc.text(`Property Name:        ${propertyName}`);
        doc.text(`Address:              ${propertyAddress}`);
        doc.text(`Room Number:          ${roomNumber}`);
        doc.moveDown(0.5);

        // Section: Lease Terms
        doc.fontSize(14).font("Helvetica-Bold").fillColor("#1a1a2e").text("3. LEASE TERMS");
        doc.moveDown(0.4);
        doc.fontSize(11).font("Helvetica").fillColor("#333");
        doc.text(`Lease Start Date:     ${leaseStart}`);
        doc.text(`Lease End Date:       ${leaseEnd}`);
        doc.text(`Monthly Rent:         ₹${rent.toLocaleString("en-IN")}`);
        doc.text(`Security Deposit:     ₹${deposit.toLocaleString("en-IN")}`);
        doc.text(`Notice Period:        30 days`);
        doc.moveDown(0.5);

        // Section: Rules
        doc.fontSize(14).font("Helvetica-Bold").fillColor("#1a1a2e").text("4. PROPERTY RULES");
        doc.moveDown(0.4);
        doc.fontSize(11).font("Helvetica").fillColor("#333");
        const rules = [
            "Quiet hours are observed from 11 PM to 7 AM.",
            "No smoking is allowed within the premises.",
            "Trash must be segregated and disposed of daily.",
            "Visitors are allowed until 10 PM.",
            "Rent is due on or before the 5th of each month.",
            "Subletting of the room is strictly prohibited.",
            "Residents must maintain cleanliness in common areas.",
        ];
        rules.forEach((rule, i) => {
            doc.text(`${i + 1}. ${rule}`);
        });
        doc.moveDown(0.5);

        // Section: Signatures
        doc.fontSize(14).font("Helvetica-Bold").fillColor("#1a1a2e").text("5. SIGNATURES");
        doc.moveDown(1);
        doc.fontSize(11).font("Helvetica").fillColor("#333");
        doc.text("Resident Signature: ____________________________       Date: ____________", { align: "left" });
        doc.moveDown(1.5);
        doc.text("Owner/Manager Signature: ______________________       Date: ____________", { align: "left" });

        // Footer
        doc.moveDown(2);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#eee").lineWidth(1).stroke();
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor("#aaa").text(`Generated by TAGT Platform on ${new Date().toLocaleDateString("en-IN")}`, { align: "center" });

        doc.end();
    } catch (err) {
        next(err);
    }
};
