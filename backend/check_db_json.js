import mongoose from "mongoose";
import fs from "fs";
import User from "./src/models/User.js";

async function check() {
    try {
        const env = JSON.parse(fs.readFileSync('.env', 'utf8'));
        const mongoUri = env.MONGO_URI;

        if (!mongoUri) {
            console.error("MONGO_URI not found in .env JSON");
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        const users = await User.find({}, { email: 1, role: 1, "verification.status": 1, status: 1, emailVerified: 1 }).lean();
        console.log("Users in DB:");
        console.dir(users, { depth: null });

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();
