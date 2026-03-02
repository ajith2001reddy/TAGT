import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";

export const generateMonthlyRent = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const month = new Date().toISOString().slice(0, 7);

        const residents = await User.find({
            role: "resident",
            isActive: true,
            ...scope
        }).lean();

        let created = 0;

        for (const resident of residents) {
            const exists = await Payment.findOne({
                propertyId: resident.propertyId,
                resident: resident._id,
                month
            });

            if (!exists) {
                await Payment.create({
                    propertyId: resident.propertyId,
                    resident: resident._id,
                    amount: resident.rent || 0,
                    type: "rent",
                    status: "pending",
                    month,
                    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5)
                });
                created++;
            }
        }

        return res.json({
            success: true,
            message: `Generated ${created} rent payments`,
            month
        });

    } catch (err) {
        next(err);
    }
};

export const markPaymentPaid = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        payment.status = "paid";
        payment.paidAt = new Date();

        await payment.save();

        return res.json({
            success: true,
            data: payment
        });
    } catch (err) {
        next(err);
    }
};

export const getAllPayments = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);

        const payments = await Payment.find(scope)
            .populate("resident", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            data: payments   // ✅ standardized
        });
    } catch (err) {
        next(err);
    }
}

export const downloadInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id)
            .populate({ path: "resident", select: "name email", options: { strictPopulate: false } });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        generateInvoicePDF(payment, res);

    } catch (err) {
        next(err);
    }
}; 