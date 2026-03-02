import "dotenv/config";  // MUST BE FIRST

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { runRentAutomationTick } from "./services/rentAutomationService.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();
        console.log("✅ Database connected");

        const server = http.createServer(app);

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        runRentAutomationTick().catch(console.error);
        setInterval(() => {
            runRentAutomationTick().catch(console.error);
        }, 60 * 60 * 1000);

    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}

startServer();