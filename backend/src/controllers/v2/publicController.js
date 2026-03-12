import Bed from "../../models/Bed.js";
import Property from "../../models/Property.js";
import Payment from "../../models/Payment.js";
import User from "../../models/User.js";

export const getPlatformStats = async (req, res) => {
    try {
        // Run aggregations concurrently for performance
        const [totalBeds, activeProperties, rentProcessedStats, totalResidents] = await Promise.all([
            Bed.countDocuments({ isDeleted: false }),
            Property.countDocuments({ isDeleted: false, status: "active" }),
            Payment.aggregate([
                { $match: { status: "paid" } },
                { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
            ]),
            User.countDocuments({ role: "resident", isDeleted: false, isActive: true })
        ]);

        const totalRent = rentProcessedStats.length > 0 ? rentProcessedStats[0].totalAmount : 0;

        // Format rent nicely (e.g., 4.2Cr, 50L)
        let formattedRent = "₹0";
        if (totalRent >= 10000000) {
            formattedRent = `₹${(totalRent / 10000000).toFixed(1)}Cr+`;
        } else if (totalRent >= 100000) {
            formattedRent = `₹${(totalRent / 100000).toFixed(1)}L+`;
        } else if (totalRent > 0) {
            formattedRent = `₹${totalRent.toLocaleString()}`;
        }

        res.status(200).json({
            success: true,
            data: {
                totalBeds: totalBeds,
                activeProperties: activeProperties,
                totalResidents: totalResidents,
                rentProcessedFormatted: formattedRent,
                rentProcessedRaw: totalRent
            }
        });
    } catch (error) {
        console.error("Error fetching platform stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
