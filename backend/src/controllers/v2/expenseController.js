import Expense from "../../models/Expense.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";

/**
 * List expenses with filters
 */
export const listExpenses = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { category, status, startDate, endDate } = req.query;

        const filter = { ...scope };
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(filter)
            .sort({ date: -1 })
            .populate("createdBy", "name")
            .lean();

        return res.json({ success: true, data: expenses });
    } catch (err) { next(err); }
};

/**
 * Create new expense (Ration, Electricity, etc)
 */
export const createExpense = async (req, res, next) => {
    try {
        const { category, name, amount, description, date, status, receiptUrl, propertyId } = req.body;

        // propertyId is guaranteed for owners/admins by verifyPropertyAccess middleware
        const finalPropertyId = propertyId || req.user.propertyId;

        if (!finalPropertyId) {
            return res.status(400).json({ success: false, message: "Property ID is required" });
        }

        const expense = await Expense.create({
            propertyId: finalPropertyId,
            category,
            name,
            amount,
            description,
            date: date || new Date(),
            status,
            receiptUrl,
            createdBy: req.user._id
        });

        return res.status(201).json({ success: true, data: expense });
    } catch (err) { next(err); }
};

/**
 * Update expense
 */
export const updateExpense = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, ...scope },
            { ...req.body },
            { new: true }
        );

        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
        return res.json({ success: true, data: expense });
    } catch (err) { next(err); }
};

/**
 * Soft delete expense
 */
export const deleteExpense = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, ...scope },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
        return res.json({ success: true, message: "Expense deleted" });
    } catch (err) { next(err); }
};

/**
 * Get expense summary (Aggregation)
 */
export const getExpenseSummary = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { startDate, endDate } = req.query;

        const filter = { ...scope };
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const stats = await Expense.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.json({ success: true, data: stats });
    } catch (err) { next(err); }
};
