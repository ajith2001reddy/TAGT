/* ================= ROUTES ================= */
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const roomRoutes = require("./routes/rooms");
const paymentRoutes = require("./routes/payments");

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

/* ================= AUTH ================= */
app.use("/api/auth", authRoutes);

/* ================= ADMIN ================= */
app.use("/api/admin", adminRoutes);

/* ================= ROOMS ================= */
app.use("/api/rooms", roomRoutes);

/* ================= PAYMENTS ================= */
app.use("/api/payments", paymentRoutes);

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
