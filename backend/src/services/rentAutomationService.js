import Payment from "../models/Payment.js";
import User from "../models/User.js";


const getMonthKey = (date = new Date()) => date.toISOString().slice(0, 7);

export const generateMonthlyRentPayments = async ({ targetDate = new Date(), propertyId = null } = {}) => {
    const month = getMonthKey(targetDate);
    const dueDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 5);

    const residentFilter = {
        role: "resident",
        isActive: true,
        ...(propertyId ? { propertyId } : {})
    };

    const residents = await User.find(residentFilter)
        .populate("roomId", "rent roomNumber")
        .select("_id propertyId roomId bedId")
        .lean();

    let created = 0;

    for (const resident of residents) {

        // 🚫 Skip if resident has no room assigned
        if (!resident.roomId) continue;

        // Extract rent safely
        const rentAmount = Number(resident.roomId.rent);

        // 🚫 Skip invalid rent values
        if (!Number.isFinite(rentAmount) || rentAmount <= 0) continue;

        // 🚫 Skip if propertyId missing
        if (!resident.propertyId) continue;

        const result = await Payment.updateOne(
            {
                propertyId: resident.propertyId,
                resident: resident._id,
                month,
                type: "rent"
            },
            {
                $setOnInsert: {
                    propertyId: resident.propertyId,
                    resident: resident._id,
                    amount: rentAmount,
                    dueDate,
                    status: "pending",
                    month,
                    type: "rent",
                    lateFee: 0,
                    totalPayable: rentAmount
                }
            },
            { upsert: true }
        );

        if (result.upsertedCount > 0) created += 1;
    }

    return { month, created, scannedResidents: residents.length };
};

export const applyLateFees = async ({ now = new Date(), lateFeePercent = 0.05, propertyId = null } = {}) => {
    const filter = {
        status: "pending",
        dueDate: { $lt: now },
        ...(propertyId ? { propertyId } : {})
    };

    const overduePayments = await Payment.find(filter).lean();
    let updated = 0;

    for (const payment of overduePayments) {
        const currentLateFee = Number(payment.lateFee || 0);
        if (currentLateFee > 0) continue;

        const lateFee = Number((Number(payment.amount || 0) * lateFeePercent).toFixed(2));
        const totalPayable = Number((Number(payment.amount || 0) + lateFee).toFixed(2));

        await Payment.updateOne(
            { _id: payment._id, status: "pending" },
            {
                $set: {
                    lateFee,
                    totalPayable,
                    status: "overdue"
                }
            }
        );
        updated += 1;
    }

    return { overdueCount: overduePayments.length, lateFeeApplied: updated };
};

let lastRunMonth = null;

export const runRentAutomationTick = async () => {
    const now = new Date();
    const month = getMonthKey(now);

    const result = { generated: null, lateFees: null, skippedMonthlyGeneration: false };

    if (now.getDate() === 1 && lastRunMonth !== month) {
        result.generated = await generateMonthlyRentPayments({ targetDate: now });
        lastRunMonth = month;
    } else {
        result.skippedMonthlyGeneration = true;
    }

    result.lateFees = await applyLateFees({ now });
    return result;
};