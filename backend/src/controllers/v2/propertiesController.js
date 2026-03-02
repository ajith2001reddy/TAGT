import mongoose from "mongoose";
import Property from "../../models/Property.js";

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

        return res.json({
            success: true,
            data: items,
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
        const property = await Property.findByIdAndUpdate(id, { status }, { new: true });

        if (!property) return res.status(404).json({ success: false, message: "Property not found" });
        return res.json({ success: true, data: property });
    } catch (err) { next(err); }
};
