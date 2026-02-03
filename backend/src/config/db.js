import mongoose from "mongoose";
import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [new winston.transports.Console()]
});

export const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        logger.error("MONGO_URI is not defined");
        process.exit(1);
    }

    mongoose.set("strictQuery", true);

    let attempts = 5;

    while (attempts > 0) {
        try {
            await mongoose.connect(mongoUri, {
                autoIndex: true,
                serverSelectionTimeoutMS: 5000
            });

            logger.info("MongoDB connected successfully");
            return;
        } catch (err) {
            attempts--;
            logger.error(`MongoDB connection failed: ${err.message}`);

            if (attempts === 0) {
                logger.error("MongoDB connection failed after retries");
                process.exit(1);
            }

            await new Promise((res) => setTimeout(res, 5000));
        }
    }
};
