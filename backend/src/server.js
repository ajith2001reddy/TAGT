import "dotenv/config";  // MUST BE FIRST



import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initScheduler } from "./jobs/scheduler.js";
import { initSocket } from "./socket.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();
        logger.info("✅ Database connected");

        const server = http.createServer(app);

        // Attach Socket.io (must be before server.listen)
        initSocket(server);

        server.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
        });

        // Initialize background jobs
        initScheduler();

    } catch (err) {
        logger.error("❌ Failed to start server", { error: err.message, stack: err.stack });
        process.exit(1);
    }
}

startServer();
