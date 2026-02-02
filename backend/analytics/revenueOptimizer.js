const Room = require("../models/Room");
const Payment = require("../models/Payment");
const { predictChurn } = require("./churnModel");

/* =====================================================
   REVENUE OPTIMIZATION ENGINE
   - Explainable AI logic
   - Business-focused insights
   - ML-ready for future
===================================================== */

async function optimizeRevenue() {
    /* =======================
       OCCUPANCY ANALYSIS
    ======================= */
    const rooms = await Room.find({}, "totalBeds occupiedBeds");

    const totals = rooms.reduce(
        (acc, r) => {
            acc.totalBeds += r.totalBeds || 0;
            acc.occupiedBeds += r.occupiedBeds || 0;
            return acc;
        },
        { totalBeds: 0, occupiedBeds: 0 }
    );

    const occupancyRate =
        totals.totalBeds === 0
            ? 0
            : (totals.occupiedBeds / totals.totalBeds) * 100;

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

    // 🔻 Low occupancy
    if (occupancyRate < 70) {
        const emptyBeds = totals.totalBeds - totals.occupiedBeds;
        const avgRent = 600; // configurable later

        revenueLeakEstimate += emptyBeds * avgRent;

        insights.push({
            type: "OCCUPANCY",
            severity: "HIGH",
            message: "Low occupancy detected",
            recommendation:
                "Consider promotional pricing or short-term discounts to improve occupancy."
        });
    }

    // 💸 Poor collection
    if (collectionRate < 85) {
        revenueLeakEstimate += totalBilled - collected;

        insights.push({
            type: "PAYMENTS",
            severity: "MEDIUM",
            message: "Low payment collection rate",
            recommendation:
                "Enable automated reminders and enforce late fees to improve cash flow."
        });
    }

    // 🚨 Churn risk
    if (highRiskResidents > 0) {
        insights.push({
            type: "CHURN",
            severity: "HIGH",
            message: `${highRiskResidents} residents at high churn risk`,
            recommendation:
                "Offer retention incentives or proactive support to prevent revenue loss."
        });
    }

    // ✅ Healthy state
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
