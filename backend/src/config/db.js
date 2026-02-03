import mongoose from "mongoose";

export const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error("❌ MONGO_URI is not defined");
        process.exit(1);
    }

    try {
        mongoose.set("strictQuery", true);

        await mongoose.connect(mongoUri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000
        });

        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
};
