import Request from "../models/Request.js";
import RequestHistory from "../models/RequestHistory.js";
import logger from "../utils/logger.js";

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
            status: "pending",
        });

        // Save history
        await RequestHistory.create({
            request: request._id,
            action: "created",
            performedBy: req.user.id,
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
        const requests = await Request.find()
            .populate("resident", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            requests,
        });
    } catch (err) {
        logger.error(`GET REQUESTS ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * GET MY REQUESTS (Resident)
 */
export const getMyRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ resident: req.user.id })
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
        const { id } = req.params;
        const { status } = req.body;

        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        request.status = status || request.status;
        await request.save();

        // Save history
        await RequestHistory.create({
            request: request._id,
            action: `status_changed_to_${request.status}`,
            performedBy: req.user.id,
        });

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
        const { id } = req.params;

        const request = await Request.findById(id);

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
