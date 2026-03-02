import User from "../models/User.js";
import Room from "../models/rooms.js";
import Payment from "../models/Payment.js";

export const generateMonthlyRent = async () => {
    try {
        const now = new Date();
        const monthKey = now.toISOString().slice(0, 7); // YYYY-MM

        const residents = await User.find({
            role: "resident",
            isActive: true
        }).lean();

        for (const resident of residents) {

            if (!resident.roomId) continue;   // 🔥 skip invalid residents

            const room = await Room.findById(resident.roomId);

            if (!room) continue;

            const exists = await Payment.findOne({
                propertyId: resident.propertyId,
                resident: resident._id,
                month
            });

            if (!exists) {
                await Payment.create({
                    propertyId: resident.propertyId,
                    resident: resident._id,
                    room: room._id,
                    amount: room.rent,
                    type: "rent",
                    status: "pending",
                    month,
                    dueDate
                });
            }
        }

        console.log("Monthly rent generation complete");
    } catch (err) {
        console.error("RENT GENERATOR ERROR:", err.message);
    }
};