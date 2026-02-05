import Payment from "../models/Payment.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

/**
 * CREATE PAYMENT (Admin)
 */
export const createPayment = async (req, res, next) => {
    try {
        const { residentId, amount, method, note } = req.body;

        if (!residentId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Resident and amount are required",
            });
        }

        const resident = await User.findById(residentId);

        if (!resident || resident.role !== "resident") {
            return res.status(404).json({
                success: false,
                message: "Resident not found",
            });
        }

        const payment = await Payment.create({
            resident: residentId,
            amount,
            method: method || "cash",
            note: note || "",
            status: "paid",
            createdBy: req.user.id,
        });

        return res.status(201).json({
            success: true,
            payment,
        });
    } catch (err) {
        logger.error(`CREATE PAYMENT ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * GET ALL PAYMENTS (Admin)
 */
export const getAllPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate("resident", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            payments,
        });
    } catch (err) {
        logger.error(`GET PAYMENTS ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * GET MY PAYMENTS (Resident)
 */
export const getMyPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({ resident: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            payments,
        });
    } catch (err) {
        logger.error(`GET MY PAYMENTS ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * DELETE PAYMENT (Admin)
 */
export const deletePayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        await payment.deleteOne();

        return res.json({
            success: true,
            message: "Payment deleted successfully",
        });
    } catch (err) {
        logger.error(`DELETE PAYMENT ERROR: ${err.message}`);
        next(err);
    }
};
