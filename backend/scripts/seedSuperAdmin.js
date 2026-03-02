/**
 * TAGT Super Admin Seed Script
 * 
 * Run ONCE to insert a super_admin user into MongoDB.
 * After this, sign in with the same email via Firebase on the frontend.
 * 
 * Usage:
 *   node scripts/seedSuperAdmin.js
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@tagt.app";
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || "Super Admin";

async function seed() {
    if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
        console.error("❌ Set MONGODB_URI in your .env file");
        process.exit(1);
    }

    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });

    if (existing) {
        if (existing.role !== "super_admin") {
            await User.findByIdAndUpdate(existing._id, { role: "super_admin" });
            console.log(`✅ Updated ${SUPER_ADMIN_EMAIL} → role: super_admin`);
        } else {
            console.log(`ℹ️  Super admin ${SUPER_ADMIN_EMAIL} already exists — nothing to do.`);
        }
    } else {
        await User.create({
            name: SUPER_ADMIN_NAME,
            email: SUPER_ADMIN_EMAIL,
            role: "super_admin",
            isActive: true,
        });
        console.log(`✅ Created super admin: ${SUPER_ADMIN_EMAIL}`);
    }

    console.log("\n📌 Next steps:");
    console.log(`   1. Go to https://console.firebase.google.com`);
    console.log(`   2. Create a Firebase user with email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   3. Set a password for that Firebase account`);
    console.log(`   4. Log in on the frontend with ${SUPER_ADMIN_EMAIL} — you'll have super_admin access`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
});
