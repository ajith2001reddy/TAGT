const Resident = require("../models/Resident");
const Payment = require("../models/Payment");
const Request = require("../models/Request");

/* =====================================================
   RESIDENT CHURN PREDICTION MODEL
   - Rule-based AI scoring
   - Explainable & fast
   - ML-ready later
===================================================== */

/**
 * Calculate churn score for a single resident
 */
async function calculateResidentChurn(resident) {
    let score = 0;
    const reasons = [];

    /* =======================
       PAYMENT BEHAVIOR
    ======================= */
    const payments = await Payment.find({
        residentId: resident._id
    }).sort({ createdAt: -1 });

    const unpaid = payments.filter(
        (p) => p.status === "unpaid"
    ).length;

    if (unpaid >= 2) {
        score += 30;
        reasons.push("Multiple unpaid payments");
    } else if (unpaid === 1) {
        score += 15;
        reasons.push("Recent unpaid payment");
    }

    /* =======================
       MAINTENANCE REQUESTS
    ======================= */
    const requests = await Request.find({
        residentId: resident._id
    }).sort({ createdAt: -1 });

    if (requests.length >= 5) {
        score += 20;
        reasons.push("High number of maintenance requests");
    }

    const recentComplaint = requests.find((r) => {
        const days =
            (Date.now() - new Date(r.createdAt)) /
            (1000 * 60 * 60 * 24);
        return days <= 30;
    });

    if (recentComplaint) {
        score += 10;
        reasons.push("Recent maintenance complaint");
    }

    /* =======================
       ACTIVITY / INACTIVITY
    ======================= */
    const lastActivity = resident.updatedAt || resident.createdAt;
    const inactiveDays =
        (Date.now() - new Date(lastActivity)) /
        (1000 * 60 * 60 * 24);

    if (inactiveDays > 90) {
        score += 15;
        reasons.push("Inactive for over 90 days");
    }

    /* =======================
       TENURE FACTOR
    ======================= */
    const tenureDays =
        (Date.now() - new Date(resident.createdAt)) /
        (1000 * 60 * 60 * 24);

    if (tenureDays < 60) {
        score += 10;
        reasons.push("New resident (low tenure)");
    }

    /* =======================
       NORMALIZE SCORE
    ======================= */
    score = Math.min(100, score);

    let riskLevel = "LOW";
    if (score >= 60) riskLevel = "HIGH";
    else if (score >= 30) riskLevel = "MEDIUM";

    return {
        residentId: resident._id,
        name: resident.name,
        email: resident.email,
        score,
        riskLevel,
        reasons
    };
}

/**
 * Predict churn risk for all residents
 */
async function predictChurn() {
    const residents = await Resident.find();
    const results = [];

    for (const resident of residents) {
        const churn = await calculateResidentChurn(resident);
        results.push(churn);
    }

    // Sort highest risk first
    results.sort((a, b) => b.score - a.score);

    return {
        generatedAt: new Date(),
        totalResidents: residents.length,
        highRisk: results.filter((r) => r.riskLevel === "HIGH").length,
        mediumRisk: results.filter((r) => r.riskLevel === "MEDIUM").length,
        lowRisk: results.filter((r) => r.riskLevel === "LOW").length,
        residents: results
    };
}

module.exports = {
    predictChurn
};
