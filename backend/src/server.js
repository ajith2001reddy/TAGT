import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
// ✅ Force IPv4 first (fix MongoDB SRV ECONNREFUSED issue)
dns.setDefaultResultOrder("ipv4first");

import dotenv from "dotenv";
dotenv.config();
import http from "http";

import app from "./app.js";
import { connectDB } from "./config/db.js";



const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Connect Database first
        await connectDB();
        console.log("✅ Database connected");

        const server = http.createServer(app);

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        // Handle unhandled promise rejections
        process.on("unhandledRejection", (err) => {
            console.error("❌ UNHANDLED REJECTION:", err);
            server.close(() => process.exit(1));
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("⚠️ SIGTERM received. Shutting down gracefully.");
            server.close(() => process.exit(0));
        });

        process.on("SIGINT", () => {
            console.log("⚠️ SIGINT received. Shutting down.");
            server.close(() => process.exit(0));
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}

startServer();