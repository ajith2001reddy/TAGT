import mongoose from "mongoose";
import dns from "dns";
import Property from "./src/models/Property.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function check() {
    try {
        const mongoUri = "mongodb+srv://ajithpavanreddy_db_user:Ajithreddy2001@tagtdbdata.zjb2urc.mongodb.net/?appName=TAGTDBdata";
        await mongoose.connect(mongoUri);
        const properties = await Property.find({}).lean();
        console.log("Current Properties in DB:");
        console.dir(properties, { depth: null });
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();
