import mongoose from "mongoose";
import dns from "dns";
import User from "./src/models/User.js";
import Property from "./src/models/Property.js";

// 🛠️ FIX: Force reliable DNS for MongoDB+SRV resolution
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function fix() {
    try {
        const mongoUri = "mongodb+srv://ajithpavanreddy_db_user:Ajithreddy2001@tagtdbdata.zjb2urc.mongodb.net/?appName=TAGTDBdata";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        const targetEmail = "ajithpavanreddykambam@gmail.com";

        // 1. Fix User Verification State
        const user = await User.findOne({ email: targetEmail });
        if (user) {
            user.verification = { status: "approved" };
            user.status = "active";
            user.emailVerified = true;
            await user.save();
            console.log(`✅ Fixed verification for user: ${targetEmail}`);
        } else {
            console.log(`❌ User not found: ${targetEmail}`);
        }

        // 2. Assign any unassigned properties to this owner
        const unassignedProperty = await Property.findOne({ ownerId: null });
        if (unassignedProperty && user) {
            unassignedProperty.ownerId = user._id;
            await unassignedProperty.save();
            console.log(`✅ Assigned property '${unassignedProperty.name}' to owner: ${targetEmail}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

fix();
