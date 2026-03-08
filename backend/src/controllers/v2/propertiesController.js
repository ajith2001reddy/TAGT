import mongoose from "mongoose";
import Property from "../../models/Property.js";
import Room from "../../models/rooms.js";
import Bed from "../../models/Bed.js";
import User from "../../models/User.js";
import propertyService from "../../services/propertyService.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import logger from "../../utils/logger.js";

/**
 * List all properties (Super Admin only)
 */
export const listProperties = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Property.find()
                .populate("owner", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Property.countDocuments({})
        ]);

        // Enrich with real-time room/bed counts
        const enrichedItems = await Promise.all(items.map(async (prop) => {
            const roomsInProp = await Room.find({ propertyId: prop._id }).distinct('_id');
            const [totalRooms, totalBeds, occupiedBeds] = await Promise.all([
                Room.countDocuments({ propertyId: prop._id }),
                Bed.countDocuments({ roomId: { $in: roomsInProp } }),
                Bed.countDocuments({ roomId: { $in: roomsInProp }, status: "occupied" })
            ]);
            return {
                ...prop,
                totalRooms,
                totalBeds,
                occupiedBeds
            };
        }));

        return res.json({
            success: true,
            data: enrichedItems,
            pagination: { page, limit, total }
        });
    } catch (err) { next(err); }
};

/**
 * Update property status (Super Admin only)
 */
export const updatePropertyStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid property id" });
        }

        const { status } = req.body;
        const property = await propertyService.updateStatus(id, status);

        return res.json({ success: true, data: property });
    } catch (err) { next(err); }
};

/**
 * Update property details (Super Admin only)
 */
export const updateProperty = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid property id" });
        }

        const allowedFields = ["name", "address", "city", "phone", "gstin", "pan", "status", "type"];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const property = await propertyService.update(id, updates);

        if (!property) return res.status(404).json({ success: false, message: "Property not found" });
        return res.json({ success: true, data: property });
    } catch (err) { next(err); }
};


/**
 * Public/Resident Discovery: Search for properties
 */
export const discoverProperties = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = { status: "active" }; // Only show approved/active properties

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } }
            ];
        }

        const properties = await Property.find(query)
            .select("name address city phone heroImage images")
            .limit(50)
            .lean();

        return res.json({ success: true, data: properties });
    } catch (err) { next(err); }
};



/**
 * Super Admin: Full edit of any owner's account details
 */
export const superAdminUpdateOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, isActive } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email.toLowerCase().trim();
        if (phone !== undefined) updates.phone = phone;
        if (isActive !== undefined) updates.isActive = isActive;

        const owner = await User.findOneAndUpdate(
            { _id: id, role: "owner" },
            updates,
            { new: true, runValidators: true }
        ).populate("propertyIds", "name city");

        if (!owner) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        logger.info(`Super admin updated owner ${owner._id}`);
        return res.json({ success: true, data: owner });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Email already in use by another user" });
        }
        next(err);
    }
};
/**
 * Get properties based on user role
 */
export const getMyProperties = async (req, res, next) => {
    try {
        let query = {};

        if (req.user.role === "owner") {
            query = buildPropertyFilter(req.user, null, "owner");
        } else if (req.user.role === "resident") {
            query = { _id: req.user.propertyId };
        } else if (req.user.role === "super_admin") {
            query = {};
        }

        const data = await Property.find(query).lean();
        return res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};
