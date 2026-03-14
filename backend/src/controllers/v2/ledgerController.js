import Payment from "../../models/Payment.js";
import Expense from "../../models/Expense.js";
import logger from "../../utils/logger.js";

/**
 * 9️⃣ Resident/Property Ledger API
 * Goal: Returns payments and expenses in a combined timeline.
 */
export const getUnifiedLedger = async (req, res) => {
    try {
        const propertyId = req.user.propertyId;
        const scope = req.user.role === 'super_admin' ? {} : { propertyId };

        const [payments, expenses] = await Promise.all([
            Payment.find({ ...scope, isDeleted: false })
                .populate("resident", "name")
                .sort({ createdAt: -1 })
                .lean(),
            Expense.find({ ...scope, isDeleted: false })
                .sort({ date: -1 })
                .lean()
        ]);

        // Map them to a unified format
        const unified = [
            ...payments.map(p => ({
                id: p._id,
                date: p.paidAt || p.createdAt,
                type: "income",
                category: p.type || "Rent",
                amount: p.amount,
                title: p.resident?.name || "Resident Payment",
                description: p.month,
                status: p.status
            })),
            ...expenses.map(e => ({
                id: e._id,
                date: e.date || e.createdAt,
                type: "expense",
                category: e.category,
                amount: e.amount,
                title: e.name || e.category,
                description: e.description,
                status: "paid"
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.json({
            success: true,
            data: unified
        });

    } catch (err) {
        logger.error("Unified ledger error:", { error: err.message });
        return res.status(500).json({ success: false, message: "Failed to fetch ledger" });
    }
};
