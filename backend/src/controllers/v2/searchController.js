import User from "../../models/User.js";
import Room from "../../models/Room.js";
import Payment from "../../models/Payment.js";
import Expense from "../../models/Expense.js";
import logger from "../../utils/logger.js";

/**
 * 6️⃣ Global Search API
 * Goal: Search across multiple entities (Residents, Rooms, Payments, Expenses)
 */
export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: "Search query is required" });

        const propertyId = req.user.propertyId;

        // Search scope: if owner, search their properties. if resident, limited scope.
        // For simplicity, let's assume owner/staff searching their property.
        const scope = req.user.role === 'super_admin' ? {} : { propertyId: propertyId };

        const regex = new RegExp(q, "i");

        const [residents, rooms, payments, expenses] = await Promise.all([
            // Search Residents
            User.find({
                ...scope,
                role: "resident",
                $or: [{ name: regex }, { email: regex }, { phoneNumber: regex }, { aadhaarNumber: regex }]
            }).limit(5).select("name email phoneNumber roomId isActive"),

            // Search Rooms
            Room.find({
                ...scope,
                roomNumber: regex
            }).limit(5),

            // Search Payments
            Payment.find({
                ...scope,
                $or: [{ month: regex }, { type: regex }, { notes: regex }]
            }).populate("resident", "name").limit(5),

            // Search Expenses
            Expense.find({
                ...scope,
                $or: [{ name: regex }, { category: regex }, { description: regex }]
            }).limit(5)
        ]);

        return res.json({
            success: true,
            data: {
                residents,
                rooms,
                payments,
                expenses
            }
        });

    } catch (err) {
        logger.error("Global search error:", { error: err.message });
        return res.status(500).json({ success: false, message: "Search failed" });
    }
};
