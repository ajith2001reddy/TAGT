import Request from "../../models/Request.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";

/**
 * List all maintenance requests
 */
export const listRequests = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const requests = await Request.find(scope)
            .populate("resident", "name email")
            .sort({ createdAt: -1 })
            .lean();
        return res.json({ success: true, data: requests });
    } catch (err) {
        next(err);
    }
};

/**
 * Update request status or details
 */
export const updateRequest = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const request = await Request.findOneAndUpdate({ _id: req.params.id, ...scope }, req.body, { new: true });
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });
        return res.json({ success: true, data: request });
    } catch (err) {
        next(err);
    }
};

/**
 * Resident creates a new request
 */
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
    } catch (err) {
        next(err);
    }
};
