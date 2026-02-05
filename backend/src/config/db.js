import mongoose from "mongoose";
import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
});

export const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        logger.error("❌ MONGO_URI is not defined in environment variables");
        process.exit(1);
    }

    mongoose.set("strictQuery", true);

    let attempts = 5;

    while (attempts > 0) {
        try {
            await mongoose.connect(mongoUri, {
                autoIndex: true,
                serverSelectionTimeoutMS: 5000,
            });

            logger.info("✅ MongoDB connected successfully");

            // Handle runtime DB errors
            mongoose.connection.on("error", (err) => {
                logger.error("❌ MongoDB runtime error:", err);
            });

            mongoose.connection.on("disconnected", () => {
                logger.warn("⚠️ MongoDB disconnected");
            });

            return;
        } catch (err) {
            attempts--;

            logger.error(`❌ MongoDB connection failed: ${err.message}`);
            logger.info(`🔁 Retries left: ${attempts}`);

            if (attempts === 0) {
                logger.error("❌ MongoDB connection failed after all retries");
                process.exit(1);
            }

            // Wait before retry
            await new Promise((res) => setTimeout(res, 5000));
        }
    }
};
