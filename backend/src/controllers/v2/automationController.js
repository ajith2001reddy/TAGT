import { applyLateFees, generateMonthlyRentPayments, runRentAutomationTick } from "../../services/rentAutomationService.js";

export const runMonthlyRentGeneration = async (req, res, next) => {
    try {
        const propertyId = req.user.role === "super_admin" ? (req.body.propertyId || null) : req.user.propertyId;
        const result = await generateMonthlyRentPayments({ propertyId });
        return res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const runLateFeeUpdate = async (req, res, next) => {
    try {
        const propertyId = req.user.role === "super_admin" ? (req.body.propertyId || null) : req.user.propertyId;
        const result = await applyLateFees({ propertyId });
        return res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const runAutomationTickNow = async (req, res, next) => {
    try {
        const result = await runRentAutomationTick();
        return res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};
