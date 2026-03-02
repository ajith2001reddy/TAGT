import mongoose from "mongoose";
import User from "../../models/User.js";
import Room from "../../models/rooms.js";
import Payment from "../../models/Payment.js";
import Request from "../../models/Request.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import Property from "../../models/Property.js";

export const providerOverview = async (req, res, next) => {
    try {
        const [totalProperties, totalOwners, totalResidents, revenue] = await Promise.all([
            Property.countDocuments({}),
            User.countDocuments({ role: "owner" }),
            User.countDocuments({ role: "resident" }),
            Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
        ]);
        return res.json({ success: true, data: { totalProperties, totalOwners, totalResidents, platformRevenue: revenue[0]?.total || 0 } });
    } catch (err) { next(err); }
};

export const listProperties = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Property.find().populate("owner", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Property.countDocuments({})
        ]);

        return res.json({ success: true, data: items, pagination: { page, limit, total } });
    } catch (err) { next(err); }
};

export const updatePropertyStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid property id" });
        const property = await Property.findByIdAndUpdate(propertyId, {
            owner: ownerId
        });
        if (!property) return res.status(404).json({ success: false, message: "Property not found" });
        return res.json({ success: true, data: property });
    } catch (err) { next(err); }
};



const resolvePropertyIdForWrite = (req) => {
    if (req.user.role === "owner" || req.user.role === "resident") return req.user.propertyId;
    return req.body.propertyId || req.query.propertyId || null;
};

export const ownerDashboardAnalytics = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const propertyMatch = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const [totalResidents, totalRooms, pendingPayments, overduePayments, revenueAgg, occupancyAgg] = await Promise.all([
            User.countDocuments({ role: "resident", isActive: true, ...propertyMatch }),
            Room.countDocuments({ ...propertyMatch }),
            Payment.countDocuments({ status: "pending", ...propertyMatch }),
            Payment.countDocuments({ status: "pending", dueDate: { $lt: new Date() }, ...propertyMatch }),
            Payment.aggregate([{ $match: { status: "paid", ...propertyMatch } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
            Room.aggregate([{ $match: propertyMatch }, { $group: { _id: null, occupied: { $sum: "$occupiedBeds" }, total: { $sum: "$totalBeds" } } }])
        ]);

        const occupied = occupancyAgg[0]?.occupied || 0;
        const totalBeds = occupancyAgg[0]?.total || 0;

        return res.json({
            success: true,
            data: {
                totalResidents,
                totalRooms,
                occupancyRate: totalBeds ? Number(((occupied / totalBeds) * 100).toFixed(2)) : 0,
                pendingPayments,
                overduePayments,
                monthlyRevenue: revenueAgg[0]?.total || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

export const listRooms = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const rooms = await Room.find({ ...(scope.propertyId ? { propertyId: scope.propertyId } : {}) }).sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: rooms });
    } catch (err) { next(err); }
};

export const createRoom = async (req, res, next) => {
    try {
        const propertyId = resolvePropertyIdForWrite(req);
        if (!propertyId) return res.status(400).json({ success: false, message: "propertyId is required" });
        const { roomNumber, totalBeds, rentAmount, maintenanceMode, maintenanceNote, note } = req.body;
        const room = await Room.create({ propertyId, roomNumber, totalBeds, rent: rentAmount, maintenanceMode: Boolean(maintenanceMode), maintenanceNote: maintenanceNote || "", note: note || "" });
        return res.status(201).json({ success: true, data: room });
    } catch (err) { next(err); }
};

export const updateRoom = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid room id" });

        const filter = { _id: id, ...(scope.propertyId ? { propertyId: scope.propertyId } : {}) };
        const update = {
            ...(req.body.roomNumber !== undefined ? { roomNumber: req.body.roomNumber } : {}),
            ...(req.body.totalBeds !== undefined ? { totalBeds: req.body.totalBeds } : {}),
            ...(req.body.occupiedBeds !== undefined ? { occupiedBeds: req.body.occupiedBeds } : {}),
            ...(req.body.rentAmount !== undefined ? { rent: req.body.rentAmount } : {}),
            ...(req.body.maintenanceMode !== undefined ? { maintenanceMode: Boolean(req.body.maintenanceMode) } : {}),
            ...(req.body.maintenanceNote !== undefined ? { maintenanceNote: req.body.maintenanceNote } : {}),
            ...(req.body.note !== undefined ? { note: req.body.note } : {})
        };

        const room = await Room.findOneAndUpdate(filter, update, { new: true });
        if (!room) return res.status(404).json({ success: false, message: "Room not found" });
        return res.json({ success: true, data: room });
    } catch (err) { next(err); }
};

export const listResidents = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const filter = req.user.role === "resident" ? { _id: req.user._id } : { role: "resident", ...(scope.propertyId ? { propertyId: scope.propertyId } : {}) };
        const residents = await User.find(filter).populate("roomId", "roomNumber rent").lean();
        return res.json({ success: true, data: residents });
    } catch (err) { next(err); }
};

export const createResident = async (req, res, next) => {
    try {
        const propertyId = resolvePropertyIdForWrite(req);
        if (!propertyId) return res.status(400).json({ success: false, message: "propertyId is required" });
        const { name, email, password, roomId } = req.body;
        const resident = await User.create({ name, email: email.toLowerCase().trim(), password, role: "resident", propertyId, roomId: roomId || null });
        return res.status(201).json({ success: true, data: resident });
    } catch (err) { next(err); }
};

export const listPayments = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const payments = await Payment.find(scope).populate("resident", "name email").sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: payments });
    } catch (err) { next(err); }
};

export const createPayment = async (req, res, next) => {
    try {
        const propertyId = resolvePropertyIdForWrite(req);
        if (!propertyId) return res.status(400).json({ success: false, message: "propertyId is required" });
        const { resident, amount, month, type, dueDate } = req.body;
        const payment = await Payment.create({ propertyId, resident, amount, month, type: type || "rent", status: "pending", dueDate });
        return res.status(201).json({ success: true, data: payment });
    } catch (err) { next(err); }
};

export const markPaymentPaid = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const filter = { _id: req.params.id, ...scope };
        const payment = await Payment.findOneAndUpdate(filter, { status: "paid", paidAt: new Date() }, { new: true });
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
        return res.json({ success: true, data: payment });
    } catch (err) { next(err); }
};

export const sendPaymentReminder = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const payment = await Payment.findOne({ _id: req.params.id, ...scope }).populate("resident", "name email").lean();
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

        console.log(`[REMINDER] Payment ${payment._id} reminder sent to ${payment.resident?.email || "unknown"}`);

        return res.json({ success: true, message: "Reminder logged", data: { paymentId: payment._id, resident: payment.resident?.email || null } });
    } catch (err) { next(err); }
};

export const listRequests = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const requests = await Request.find(scope).populate("resident", "name email").sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: requests });
    } catch (err) { next(err); }
};

export const updateRequest = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const request = await Request.findOneAndUpdate({ _id: req.params.id, ...scope }, req.body, { new: true });
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });
        return res.json({ success: true, data: request });
    } catch (err) { next(err); }
};

export const residentDashboard = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const [profile, payments, requests] = await Promise.all([
            User.findOne({ _id: req.user._id }).populate("roomId", "roomNumber rent totalBeds occupiedBeds").lean(),
            Payment.find(scope).sort({ createdAt: -1 }).limit(12).lean(),
            Request.find(scope).sort({ createdAt: -1 }).limit(20).lean()
        ]);
        return res.json({ success: true, data: { profile, payments, requests } });
    } catch (err) { next(err); }
};

export const residentCreateRequest = async (req, res, next) => {
    try {
        const resident = req.user;
        const { message, priority } = req.body;
        if (!message || !message.trim()) return res.status(400).json({ success: false, message: "message is required" });
        const created = await Request.create({
            propertyId: resident.propertyId,
            resident: resident._id,
            title: "Resident Request",
            description: message,
            message,
            priority: priority || "medium",
            status: "pending"
        });
        return res.status(201).json({ success: true, data: created });
    } catch (err) { next(err); }
};
