import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";

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