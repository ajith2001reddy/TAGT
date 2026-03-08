import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Property from "./src/models/Property.js";

dotenv.config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const residents = await User.find({ role: "resident" });
        console.log(`Found ${residents.length} residents to check.`);

        let updatedCount = 0;

        for (const resident of residents) {
            if (!resident.propertyId) {
                console.log(`Resident ${resident.email} has no propertyId assigned. Skipping.`);
                continue;
            }

            const property = await Property.findById(resident.propertyId);
            if (!property) {
                console.log(`Property ${resident.propertyId} not found for resident ${resident.email}.`);
                continue;
            }

            if (!property.owner) {
                console.log(`Property ${property.name} has no owner assigned.`);
                continue;
            }

            if (resident.ownerId && resident.ownerId.toString() === property.owner.toString()) {
                console.log(`Resident ${resident.email} already has correct ownerId.`);
                continue;
            }

            resident.ownerId = property.owner;
            await resident.save();
            updatedCount++;
            console.log(`Updated resident ${resident.email} with ownerId ${property.owner}`);
        }

        console.log(`Migration complete. Updated ${updatedCount} residents.`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
