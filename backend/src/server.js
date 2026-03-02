import "dotenv/config";  // MUST BE FIRST

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { runRentAutomationTick } from "./services/rentAutomationService.js";
import cron from "node-cron";
import { generateMonthlyRent } from "./jobs/rentGenerator.js";
import Payment from "./models/Payment.js";
import User from "./models/User.js";
import { sendRentReminder, sendOverdueNotice } from "./services/emailService.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
app.use("/api/enquiries", enquiryRoutes);
const PORT = process.env.PORT || 5000;

/* ── Cron: mark overdue payments at 2am daily ─── */
cron.schedule("0 2 * * *", async () => {
    try {
        const now = new Date();
        const result = await Payment.updateMany(
            { status: "pending", dueDate: { $lt: now } },
            { status: "overdue" }
        );
        console.log(`[CRON] Overdue updated: ${result.modifiedCount}`);
    } catch (err) {
        console.error("[CRON] Overdue cron error:", err.message);
    }
});

/* ── Cron: monthly rent generation at 1am on 1st ─ */
cron.schedule("0 1 1 * *", async () => {
    console.log("[CRON] Running monthly rent generator...");
    await generateMonthlyRent();
});

/* ── Cron: email reminders at 9am daily ──────────
   Send rent reminder to residents whose due date
   is exactly 3 days away (and not yet paid)        */
cron.schedule("0 9 * * *", async () => {
    try {
        const now = new Date();
        const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(in3Days.setHours(0, 0, 0, 0));
        const endOfDay = new Date(in3Days.setHours(23, 59, 59, 999));

        const upcomingPayments = await Payment.find({
            status: "pending",
            dueDate: { $gte: startOfDay, $lte: endOfDay },
        }).populate("resident", "name email").lean();

        let sent = 0;
        for (const p of upcomingPayments) {
            if (!p.resident?.email) continue;
            await sendRentReminder({
                name: p.resident.name,
                email: p.resident.email,
                amount: p.totalPayable || p.amount,
                dueDate: p.dueDate,
                month: p.month,
                propertyName: "TAGT Property",
            }).catch(err => console.error("[CRON EMAIL]", err.message));
            sent++;
        }
        console.log(`[CRON] Rent reminders sent: ${sent}`);
    } catch (err) {
        console.error("[CRON] Reminder cron error:", err.message);
    }
});

/* ── Cron: overdue notice emails at 10am daily ─── */
cron.schedule("0 10 * * *", async () => {
    try {
        const overduePayments = await Payment.find({ status: "overdue" })
            .populate("resident", "name email").lean();

        let sent = 0;
        for (const p of overduePayments) {
            if (!p.resident?.email) continue;
            await sendOverdueNotice({
                name: p.resident.name,
                email: p.resident.email,
                amount: p.amount,
                lateFee: p.lateFee || 0,
                month: p.month,
            }).catch(err => console.error("[CRON OVERDUE EMAIL]", err.message));
            sent++;
        }
        console.log(`[CRON] Overdue notices sent: ${sent}`);
    } catch (err) {
        console.error("[CRON] Overdue notice error:", err.message);
    }
});

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