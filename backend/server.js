require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const residentRoutes = require("./routes/resident");
const errorHandler = require("./middleware/errorHandler");

/* ================= APP INIT ================= */
const app = express();
const PORT = process.env.PORT || 5000;

/* ================= DB ================= */
connectDB();

/* ================= SECURITY ================= */
app.use(helmet());

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    })
);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(
    cors({
        origin: "*"
    })
);

/* ================= API ROUTES ONLY ================= */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resident", residentRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

/* ================= START ================= */
app.listen(PORT, () => {
    console.log(`🚀 Backend API running on port ${PORT}`);
});
