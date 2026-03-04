import JoinRequest from "../../models/JoinRequest.js";
import User from "../../models/User.js";
import Property from "../../models/Property.js";
import logger from "../../utils/logger.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import eventBus from "../../utils/eventBus.js";

/**
 * Resident: Create a join request for a property
 */
export const createJoinRequest = async (req, res, next) => {
    try {
        const { propertyId, message } = req.body;
        const residentId = req.user._id;

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        // Check if resident already has a pending or approved request for this property
        const existing = await JoinRequest.findOne({
            residentId,
            propertyId,
            status: { $in: ["pending", "approved"] },
            isDeleted: false
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: existing.status === "approved"
                    ? "You are already approved for this property"
                    : "You already have a pending request for this property"
            });
        }

        const request = await JoinRequest.create({
            residentId,
            propertyId,
            message
        });

        eventBus.publish("resident.request.created", { requestId: request._id, residentId, propertyId });
        res.status(201).json({ success: true, data: request });
    } catch (err) {
        next(err);
    }
};

/**
 * Owner: Get all join requests for their properties
 */
export const getPropertyJoinRequests = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const requests = await JoinRequest.find({ ...scope, isDeleted: false })
            .populate("residentId", "name email phone photo")
            .populate("propertyId", "name address city")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: requests });
    } catch (err) {
        next(err);
    }
};

/**
 * Owner: Approve a join request
 */
export const approveJoinRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const scope = buildPropertyFilter(req.user);

        const request = await JoinRequest.findOne({ _id: id, ...scope, status: "pending", isDeleted: false });
        if (!request) {
            return res.status(404).json({ success: false, message: "Pending request not found or unauthorized" });
        }

        // Update Request
        request.status = "approved";
        request.processedBy = req.user._id;
        request.processedAt = new Date();
        await request.save();

        // Update User
        await User.findByIdAndUpdate(request.residentId, {
            propertyId: request.propertyId,
            status: "active",
            isActive: true
        });

        eventBus.publish("resident.approved", {
            requestId: request._id,
            residentId: request.residentId,
            propertyId: request.propertyId,
            processedBy: req.user._id
        });
        res.json({ success: true, message: "Request approved and resident assigned to property" });
    } catch (err) {
        next(err);
    }
};

/**
 * Owner: Reject a join request
 */
export const rejectJoinRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const scope = buildPropertyFilter(req.user);

        const request = await JoinRequest.findOne({ _id: id, ...scope, status: "pending", isDeleted: false });
        if (!request) {
            return res.status(404).json({ success: false, message: "Pending request not found or unauthorized" });
        }

        request.status = "rejected";
        request.processedBy = req.user._id;
        request.processedAt = new Date();
        await request.save();

        logger.info("Join Request Rejected", { requestId: id, residentId: request.residentId });
        res.json({ success: true, message: "Request rejected" });
    } catch (err) {
        next(err);
    }
};
