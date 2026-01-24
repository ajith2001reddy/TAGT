require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// ✅ CORS (allow all for now)
app.use(cors({ origin: "*" }));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/resident", require("./routes/resident"));

// Root (optional)
app.get("/", (req, res) => {
    res.send("TAGT Backend API is running 🚀");
});

app.listen(PORT, () => {
    console.log(`TAGT Backend running on port ${PORT}`);
});
module.exports = router;
