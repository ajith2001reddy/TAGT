import logger from "../utils/logger.js";

const requiredEnvVars = [
    "MONGO_URI",
    "JWT_SECRET",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "STRIPE_SECRET_KEY",
    "REDIS_URL"
];

/**
 * Validates that all required environment variables are set.
 * Throws an error if any are missing.
 */
export const validateEnv = () => {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
        const errorMsg = `❌ Missing required environment variables: ${missing.join(", ")}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    logger.info("✅ Environment variables validated.");
};
