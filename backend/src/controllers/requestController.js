import Request from "../models/Request.js";
import logger from "../utils/logger.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";
/**
 * CREATE REQUEST (Resident)
 */
export const createRequest = async (req, res, next) => {
    try {
        const { title, description, priority } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required",
            });
        }

        const request = await Request.create({
            resident: req.user.id,
            title,
            description,
            priority: priority || "medium",
        });

        return res.status(201).json({
            success: true,
            request,
        });
    } catch (err) {
        logger.error(`CREATE REQUEST ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * GET ALL REQUESTS (Admin)
 */
export const getAllRequests = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const requests = await Request.find({ ...scope })
            .populate("resident", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            requests,
        });
    } catch (err) {
        logger.error(`GET ALL REQUESTS ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * GET MY REQUESTS (Resident)
 */
export const getMyRequests = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const requests = await Request.find({ ...scope, resident: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            requests,
        });
    } catch (err) {
        logger.error(`GET MY REQUESTS ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * UPDATE REQUEST STATUS (Admin)
 */
export const updateRequestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!["pending", "in-progress", "resolved"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        const request = await Request.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        return res.json({
            success: true,
            request,
        });
    } catch (err) {
        logger.error(`UPDATE REQUEST ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * DELETE REQUEST (Admin)
 */
export const deleteRequest = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const request = await Request.findById(req.params.id, ...scope);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        await request.deleteOne();

        return res.json({
            success: true,
            message: "Request deleted successfully",
        });
    } catch (err) {
        logger.error(`DELETE REQUEST ERROR: ${err.message}`);
        next(err);
    }
};