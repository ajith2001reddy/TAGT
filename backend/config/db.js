const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is not defined");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000
        });

        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
