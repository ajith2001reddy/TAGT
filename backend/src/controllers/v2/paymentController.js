import Payment from "../../models/Payment.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import { generateInvoicePDF } from "../../utils/invoiceGenerator.js";

/**
 * List all payments for the scoped property
 */
export const listPayments = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const filter = req.user.role === "resident"
            ? { resident: req.user._id, ...scope }
            : scope;

        const payments = await Payment.find(filter)
            .populate("resident", "name email")
            .sort({ createdAt: -1 })
            .lean();
        return res.json({ success: true, data: payments });
    } catch (err) {
        next(err);
    }
};

/**
 * Create a manual payment/bill
 */
export const createPayment = async (req, res, next) => {
    try {
        const propertyId = req.body.propertyId || req.user.propertyId;
        if (!propertyId) return res.status(400).json({ success: false, message: "propertyId is required" });

        // 🔐 SECURITY: Ensure owner owns this property
        if (req.user.role === "owner" && !req.user.propertyIds?.some(id => id.toString() === propertyId.toString())) {
            return res.status(403).json({ success: false, message: "Unauthorized property access" });
        }

        const { resident, amount, month, type, dueDate } = req.body;
        const payment = await Payment.create({
            propertyId,
            resident,
            amount,
            month,
            type: type || "rent",
            status: "pending",
            dueDate
        });

        return res.status(201).json({ success: true, data: payment });
    } catch (err) {
        next(err);
    }
};

/**
 * Mark a payment as paid
 */
export const markPaymentPaid = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const filter = { _id: req.params.id, ...scope };

        const payment = await Payment.findOneAndUpdate(
            filter,
            { status: "paid", paidAt: new Date() },
            { new: true }
        );

        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
        return res.json({ success: true, data: payment });
    } catch (err) {
        next(err);
    }
};

/**
 * Download invoice PDF
 */
export const downloadInvoice = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const filter = { _id: req.params.id, ...scope };

        const payment = await Payment
            .findOne(filter)
            .populate("resident", "name email")
            .populate("propertyId", "name address city gstin pan phone");

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        generateInvoicePDF(payment, res);
    } catch (err) {
        next(err);
    }
};

/**
 * Send payment reminder email
 */
export const sendPaymentReminder = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const payment = await Payment.findOne({ _id: req.params.id, ...scope })
            .populate("resident", "name email")
            .lean();

        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

        // Logic for sending reminder (mocked for now as in platformController)
        console.log(`[REMINDER] Payment ${payment._id} reminder sent to ${payment.resident?.email || "unknown"}`);

        return res.json({
            success: true,
            message: "Reminder logged",
            data: { paymentId: payment._id, resident: payment.resident?.email || null }
        });
    } catch (err) {
        next(err);
    }
};
