const User = require("../models/User");
const Payment = require("../models/Payment");
const Request = require("../models/Request");

async function calculateResidentChurn(resident) {
    let score = 0;
    const reasons = [];

    const [payments, requests] = await Promise.all([
        Payment.find({ residentId: resident._id }).lean(),
        Request.find({ residentId: resident._id }).lean()
    ]);

    const unpaidCount = payments.filter(p => p.status === "unpaid").length;

    if (unpaidCount >= 2) {
        score += 30;
        reasons.push("Multiple unpaid payments");
    } else if (unpaidCount === 1) {
        score += 15;
        reasons.push("Recent unpaid payment");
    }

    if (requests.length >= 5) {
        score += 20;
        reasons.push("High number of maintenance requests");
    }

    const hasRecentComplaint = requests.some(r => {
        const days =
            (Date.now() - new Date(r.createdAt)) /
            (1000 * 60 * 60 * 24);
        return days <= 30;
    });

    if (hasRecentComplaint) {
        score += 10;
        reasons.push("Recent maintenance complaint");
    }

    const lastActivity = resident.updatedAt || resident.createdAt;
    const inactiveDays =
        (Date.now() - new Date(lastActivity)) /
        (1000 * 60 * 60 * 24);

    if (inactiveDays > 90) {
        score += 15;
        reasons.push("Inactive for over 90 days");
    }

    const tenureDays =
        (Date.now() - new Date(resident.createdAt)) /
        (1000 * 60 * 60 * 24);

    if (tenureDays < 60) {
        score += 10;
        reasons.push("New resident (low tenure)");
    }

    score = Math.min(score, 100);

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

async function predictChurn() {
    const residents = await User.find({
        role: "resident",
        isActive: true
    }).lean();

    const residentsData = await Promise.all(
        residents.map(calculateResidentChurn)
    );

    residentsData.sort((a, b) => b.score - a.score);

    return {
        generatedAt: new Date(),
        totalResidents: residentsData.length,
        highRisk: residentsData.filter(r => r.riskLevel === "HIGH").length,
        mediumRisk: residentsData.filter(r => r.riskLevel === "MEDIUM").length,
        lowRisk: residentsData.filter(r => r.riskLevel === "LOW").length,
        residents: residentsData
    };
}

module.exports = { predictChurn };
