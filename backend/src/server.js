import dotenv from "dotenv";
import http from "http";

import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        const server = http.createServer(app);

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        process.on("unhandledRejection", (err) => {
            console.error("UNHANDLED REJECTION:", err);
            server.close(() => process.exit(1));
        });

        process.on("SIGTERM", () => {
            console.log("SIGTERM received. Shutting down gracefully.");
            server.close(() => process.exit(0));
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}

startServer();
