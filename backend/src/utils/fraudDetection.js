/**
 * Evaluates the user and request to generate a fraud risk score.
 * 
 * @param {Object} user The user object from the DB
 * @returns {Object} { score: Number, risk: String }
 */
export function fraudDetection(user) {
    let score = 0;

    // Email pattern check
    if (user.email) {
        const disposableDomains = ["tempmail.com", "mailinator.com", "10minutemail.com", "yopmail.com", "guerrillamail.com"];
        const domain = user.email.split("@")[1];
        if (disposableDomains.includes(domain)) {
            score += 40;
        }

        if (user.email.includes("test") || user.email.includes("dummy")) {
            score += 20;
        }
    }

    // Basic IP check (in a real scenario, you'd check IP abuse DBs or account count per IP via Redis/Mongo)
    // We add 0 for now unless we implement IP tracking

    // Additional generic flags
    if (!user.name || user.name.length < 3) {
        score += 10;
    }

    // Determine risk level
    let risk = "low";
    if (score > 70) {
        risk = "high";
    } else if (score > 40) {
        risk = "medium";
    }

    return { score, risk };
}
