import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Property from "./src/models/Property.js";

dotenv.config();

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const owners = await User.find({ role: "owner" });
        console.log(`Found ${owners.length} owners`);

        for (const owner of owners) {
            const properties = await Property.find({ owner: owner._id });
            console.log(`Owner: ${owner.email} (${owner._id})`);
            console.log(`  - propertyIds in User doc: ${JSON.stringify(owner.propertyIds)}`);
            console.log(`  - Properties found pointing to this owner: ${properties.length}`);
            properties.forEach(p => console.log(`    * Property: ${p.name} (${p._id})`));

            if (owner.propertyIds.length === 0 && properties.length > 0) {
                console.log(`  [!] ALERT: User has properties in DB but propertyIds array is empty!`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
