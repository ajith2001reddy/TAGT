import mongoose from "mongoose";
import winston from "winston"; // For logging

// Configure logging
const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        })
    ]
});

// Database connection with retry logic
export const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        logger.error("❌ MONGO_URI is not defined");
        process.exit(1);
    }

    try {
        mongoose.set("strictQuery", true);

        // Retry logic for MongoDB connection
        let attempts = 5;
        while (attempts > 0) {
            try {
                await mongoose.connect(mongoUri, {
                    autoIndex: true,
                    serverSelectionTimeoutMS: 5000,
                });
                logger.info("✅ MongoDB connected successfully");
                break;
            } catch (error) {
                attempts--;
                logger.error(`❌ MongoDB connection failed: ${error.message}`);
                if (attempts > 0) {
                    logger.info(`Retrying to connect... ${attempts} attempts left`);
                    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
                } else {
                    logger.error("MongoDB connection failed after multiple attempts.");
                    process.exit(1); // Exit the process after failed retries
                }
            }
        }
    } catch (error) {
        logger.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
};
