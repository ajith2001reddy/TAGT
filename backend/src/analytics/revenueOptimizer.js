// src/analytics/revenueOptimizer.js

import Room from "../models/rooms.js";
import Payment from "../models/Payment.js";
import { predictChurn } from "./churnEngine.js";

export const optimizeRevenue = async () => {
    const [rooms, payments] = await Promise.all([
        Room.find({}, "totalBeds occupiedBeds rent").lean(),
        Payment.find({}, "amount status").lean()
    ]);

    const totals = rooms.reduce(
        (acc, room) => {
            const beds = room.totalBeds || 0;
            acc.totalBeds += beds;
            acc.occupiedBeds += room.occupiedBeds || 0;
            acc.totalRent += (room.rent || 0) * beds;
            return acc;
        },
        { totalBeds: 0, occupiedBeds: 0, totalRent: 0 }
    );

    const occupancyRate =
        totals.totalBeds === 0
            ? 0
            : (totals.occupiedBeds / totals.totalBeds) * 100;

    const avgRent =
        totals.totalBeds === 0
            ? 0
            : totals.totalRent / totals.totalBeds;

    let totalBilled = 0;
    let totalCollected = 0;

    for (const p of payments) {
        totalBilled += p.amount || 0;
        if (p.status === "paid") totalCollected += p.amount || 0;
    }

    const collectionRate =
        totalBilled === 0
            ? 0
            : (totalCollected / totalBilled) * 100;

    let highRiskResidents = 0;
    try {
        const churnData = await predictChurn();
        highRiskResidents = churnData?.highRisk || 0;
    } catch { }

    const insights = [];
    let revenueLeakEstimate = 0;

    if (occupancyRate < 70) {
        const emptyBeds = totals.totalBeds - totals.occupiedBeds;
        revenueLeakEstimate += emptyBeds * avgRent;

        insights.push({
            type: "OCCUPANCY",
            severity: "HIGH",
            message: "Low occupancy detected",
            recommendation:
                "Offer promotions, flexible pricing, or partnerships to increase occupancy."
        });
    }

    if (collectionRate < 85) {
        revenueLeakEstimate += totalBilled - totalCollected;

        insights.push({
            type: "PAYMENTS",
            severity: "MEDIUM",
            message: "Low payment collection rate",
            recommendation:
                "Enable automated reminders, enforce deadlines, or introduce incentives."
        });
    }

    if (highRiskResidents > 0) {
        insights.push({
            type: "CHURN",
            severity: "HIGH",
            message: `${highRiskResidents} residents at high churn risk`,
            recommendation:
                "Proactively engage residents and offer retention incentives."
        });
    }

    if (!insights.length) {
        insights.push({
            type: "HEALTHY",
            severity: "LOW",
            message: "Revenue performance is healthy",
            recommendation:
                "Maintain current pricing and operational strategy."
        });
    }

    return {
        generatedAt: new Date(),
        metrics: {
            occupancyRate: Number(occupancyRate.toFixed(2)),
            collectionRate: Number(collectionRate.toFixed(2)),
            avgRent: Number(avgRent.toFixed(2)),
            totalBeds: totals.totalBeds,
            occupiedBeds: totals.occupiedBeds
        },
        revenueLeakEstimate: Math.round(revenueLeakEstimate),
        insights,
        meta: { mode: "snapshot" }
    };
};
