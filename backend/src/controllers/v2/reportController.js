import Payment from "../../models/Payment.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";

const esc = v => { const s = String(v ?? "").replace(/"/g, '""'); return /[",\n]/.test(s) ? `"${s}"` : s; };
const csv = (headers, rows) => [headers, ...rows.map(r => r.map(esc))].map(r => r.join(",")).join("\n");

/**
 * Monthly revenue CSV report
 */
export const reportMonthlyRevenue = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { month } = req.query;
        const filter = { ...scope, status: "paid", ...(month ? { month } : {}) };

        const payments = await Payment.find(filter)
            .populate("resident", "name email")
            .sort({ month: -1 })
            .lean();

        const content = csv(
            ["Month", "Resident Name", "Resident Email", "Amount", "Late Fee", "Total", "Paid On"],
            payments.map(p => [p.month, p.resident?.name, p.resident?.email, p.amount, p.lateFee || 0, p.totalPayable || p.amount, p.paidAt ? new Date(p.paidAt).toLocaleDateString() : ""])
        );

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=monthly-revenue-${month || "all"}.csv`);
        return res.status(200).send(content);
    } catch (err) { next(err); }
};

/**
 * Outstanding payments CSV report
 */
export const reportOutstanding = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const payments = await Payment.find({ ...scope, status: { $in: ["pending", "overdue"] } })
            .populate("resident", "name email")
            .sort({ dueDate: 1 })
            .lean();

        const content = csv(
            ["Resident Name", "Email", "Month", "Amount", "Status", "Due Date", "Days Overdue"],
            payments.map(p => {
                const days = p.dueDate ? Math.max(0, Math.floor((Date.now() - new Date(p.dueDate)) / 86400000)) : 0;
                return [p.resident?.name, p.resident?.email, p.month, p.amount, p.status, p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "", days];
            })
        );

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=outstanding-report.csv");
        return res.status(200).send(content);
    } catch (err) { next(err); }
};
