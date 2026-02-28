import mongoose from "mongoose";
import Property from "../../models/Property.js";
import User from "../../models/User.js";
import Room from "../../models/rooms.js";
import Payment from "../../models/Payment.js";
import Request from "../../models/Request.js";

const getPagination = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { page, limit, skip: (page - 1) * limit };
};

export const providerOverview = async (req, res, next) => {
    try {
        const [totalProperties, totalOwners, totalResidents, revenue] = await Promise.all([
            Property.countDocuments({}),
            User.countDocuments({ role: "owner" }),
            User.countDocuments({ role: "resident" }),
            Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
        ]);
        res.json({ success: true, data: { totalProperties, totalOwners, totalResidents, platformRevenue: revenue[0]?.total || 0 } });
    } catch (err) { next(err); }
};

export const listProperties = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const [items, total] = await Promise.all([
            Property.find().populate("owner", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Property.countDocuments({})
        ]);
        res.json({ success: true, data: items, pagination: { page, limit, total } });
    } catch (err) { next(err); }
};

export const updatePropertyStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid property id" });
        const { isActive } = req.body;
        const property = await Property.findByIdAndUpdate(id, { isActive: Boolean(isActive) }, { new: true });
        if (!property) return res.status(404).json({ success: false, message: "Property not found" });
        return res.json({ success: true, data: property });
    } catch (err) { next(err); }
};

export const ownerOverview = async (req, res, next) => {
    try {
        const propertyId = req.user.propertyId;
        const [totalResidents, totalRooms, pendingPayments, occupancy] = await Promise.all([
            User.countDocuments({ propertyId, role: "resident", isActive: true }),
            Room.countDocuments({ propertyId }),
            Payment.countDocuments({ propertyId, status: "pending" }),
            Room.aggregate([{ $match: { propertyId } }, { $group: { _id: null, occupied: { $sum: "$occupiedBeds" }, total: { $sum: "$totalBeds" } } }])
        ]);
        const occupied = occupancy[0]?.occupied || 0;
        const totalBeds = occupancy[0]?.total || 0;
        res.json({ success: true, data: { totalResidents, totalRooms, pendingPayments, occupancyRate: totalBeds ? Number(((occupied / totalBeds) * 100).toFixed(2)) : 0 } });
    } catch (err) { next(err); }
};

export const ownerRooms = async (req, res, next) => {
    try {
        const propertyId = req.user.propertyId;
        if (req.method === "GET") {
            const rooms = await Room.find({ propertyId }).sort({ createdAt: -1 }).lean();
            return res.json({ success: true, data: rooms });
        }
        if (req.method === "POST") {
            const { roomNumber, totalBeds, rentAmount, status } = req.body;
            const room = await Room.create({ propertyId, roomNumber, totalBeds, rent: rentAmount, status: status || "available" });
            return res.status(201).json({ success: true, data: room });
        }
        return res.status(405).json({ success: false, message: "Method not allowed" });
    } catch (err) { next(err); }
};

export const updateOwnerRoom = async (req, res, next) => {
    try {
        const propertyId = req.user.propertyId;
        const { id } = req.params;
        const { roomNumber, totalBeds, occupiedBeds, rentAmount, status } = req.body;
        const room = await Room.findOneAndUpdate(
            { _id: id, propertyId },
            { roomNumber, totalBeds, occupiedBeds, rent: rentAmount, status },
            { new: true }
        );
        if (!room) return res.status(404).json({ success: false, message: "Room not found" });
        return res.json({ success: true, data: room });
    } catch (err) { next(err); }
};

export const ownerResidents = async (req, res, next) => {
    try {
        const propertyId = req.user.propertyId;
        if (req.method === "GET") {
            const residents = await User.find({ propertyId, role: "resident" }).populate("roomId", "roomNumber").lean();
            return res.json({ success: true, data: residents });
        }
        const { name, email, password, roomId } = req.body;
        const resident = await User.create({ name, email: email.toLowerCase().trim(), password, role: "resident", propertyId, roomId: roomId || null });
        return res.status(201).json({ success: true, data: resident });
    } catch (err) { next(err); }
};

export const ownerPayments = async (req, res, next) => {
    try {
        const propertyId = req.user.propertyId;
        if (req.method === "GET") {
            const payments = await Payment.find({ propertyId }).populate("resident", "name email").sort({ createdAt: -1 }).lean();
            return res.json({ success: true, data: payments });
        }
        const { resident, amount, month, type, dueDate } = req.body;
        const payment = await Payment.create({ propertyId, resident, amount, month, type: type || "rent", status: "pending", dueDate });
        return res.status(201).json({ success: true, data: payment });
    } catch (err) { next(err); }
};

export const markPaymentPaid = async (req, res, next) => {
    try {
        const propertyId = req.user.propertyId;
        const payment = await Payment.findOneAndUpdate({ _id: req.params.id, propertyId }, { status: "paid", paidAt: new Date() }, { new: true });
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
        return res.json({ success: true, data: payment });
    } catch (err) { next(err); }
};

export const ownerRequests = async (req, res, next) => {
    try {
        const propertyId = req.user.propertyId;
        if (req.method === "GET") {
            const requests = await Request.find({ propertyId }).populate("resident", "name email").sort({ createdAt: -1 }).lean();
            return res.json({ success: true, data: requests });
        }
        const { id } = req.params;
        const request = await Request.findOneAndUpdate({ _id: id, propertyId }, req.body, { new: true });
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });
        return res.json({ success: true, data: request });
    } catch (err) { next(err); }
};

export const residentDashboard = async (req, res, next) => {
    try {
        const residentId = req.user._id;
        const [profile, payments, requests] = await Promise.all([
            User.findById(residentId).populate("roomId", "roomNumber rent totalBeds occupiedBeds").lean(),
            Payment.find({ resident: residentId }).sort({ createdAt: -1 }).limit(12).lean(),
            Request.find({ resident: residentId }).sort({ createdAt: -1 }).limit(20).lean()
        ]);
        return res.json({ success: true, data: { profile, payments, requests } });
    } catch (err) { next(err); }
};

export const residentCreateRequest = async (req, res, next) => {
    try {
        const resident = req.user;
        const { message, priority } = req.body;
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
