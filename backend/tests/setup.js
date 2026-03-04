import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../src/utils/logger.js";

dotenv.config();

// Silence logs during tests
logger.silent = true;

beforeAll(async () => {
    // Ensure we don't connect to production DB if accidentally set
    if (process.env.NODE_ENV === "production") {
        throw new Error("Cannot run tests in production environment!");
    }
});

afterAll(async () => {
    try {
        const redis = (await import("../src/config/redis.js")).default;
        await redis.quit();
    } catch (err) {
        // Redis might not be initialized
    }
    await mongoose.connection.close();
});
