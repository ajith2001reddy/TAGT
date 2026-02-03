const Room = require("../models/rooms");
const Payment = require("../models/Payment");
const { predictChurn } = require("./churnModel");

/* =====================================================
   REVENUE OPTIMIZATION ENGINE (SNAPSHOT-BASED)
===================================================== */

async function optimizeRevenue() {
    /* =======================
       OCCUPANCY ANALYSIS
    ======================= */
    const roomDocs = await Room.find({}, "totalBeds occupiedBeds rent");

    const totals = roomDocs.reduce(
        (acc, room) => {
            acc.totalBeds += room.totalBeds || 0;
            acc.occupiedBeds += room.occupiedBeds || 0;
            acc.totalRent += (room.rent || 0) * (room.totalBeds || 0);
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

    /* =======================
       PAYMENT COLLECTION
    ======================= */
    const payments = await Payment.find({}, "amount status");

    const totalBilled = payments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
    );

    const collected = payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const collectionRate =
        totalBilled === 0 ? 0 : (collected / totalBilled) * 100;

    /* =======================
       CHURN IMPACT
    ======================= */
    let highRiskResidents = 0;

    try {
        const churnData = await predictChurn();
        highRiskResidents = churnData?.highRisk || 0;
    } catch (err) {
        console.warn("CHURN MODEL ERROR:", err.message);
    }

    /* =======================
       INSIGHTS GENERATION
    ======================= */
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
        revenueLeakEstimate += totalBilled - collected;

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

    if (insights.length === 0) {
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
        meta: {
            mode: "snapshot"
        }
    };
}

module.exports = {
    optimizeRevenue
};
