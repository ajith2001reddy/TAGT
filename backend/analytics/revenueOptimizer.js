const rooms = require("../models/rooms");
const Payment = require("../models/Payment");
const { predictChurn } = require("./churnModel");

/* =====================================================
   REVENUE OPTIMIZATION ENGINE
===================================================== */

async function optimizeRevenue() {
    /* =======================
       OCCUPANCY ANALYSIS
    ======================= */
    const rooms = await rooms.find({}, "totalBeds occupiedBeds rent");

    const totals = rooms.reduce(
        (acc, r) => {
            acc.totalBeds += r.totalBeds || 0;
            acc.occupiedBeds += r.occupiedBeds || 0;
            acc.totalRent += (r.rent || 0) * (r.totalBeds || 0);
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
    const payments = await Payment.find();

    const totalBilled = payments.reduce(
        (s, p) => s + (p.amount || 0),
        0
    );

    const collected = payments
        .filter((p) => p.status === "paid")
        .reduce((s, p) => s + (p.amount || 0), 0);

    const collectionRate =
        totalBilled === 0 ? 0 : (collected / totalBilled) * 100;

    /* =======================
       CHURN IMPACT
    ======================= */
    const churnData = await predictChurn();
    const highRiskResidents = churnData.highRisk || 0;

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
                "Offer promotions or flexible pricing to increase occupancy."
        });
    }

    if (collectionRate < 85) {
        revenueLeakEstimate += totalBilled - collected;

        insights.push({
            type: "PAYMENTS",
            severity: "MEDIUM",
            message: "Low payment collection rate",
            recommendation:
                "Enable reminders, enforce deadlines, or automate billing."
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
        insights
    };
}

module.exports = {
    optimizeRevenue
};
