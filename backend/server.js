require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// DB
connectDB();

// ✅ CORS — FIXED
app.use(cors({
    origin: "*"
}));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/resident", require("./routes/resident"));

// Server
app.listen(PORT, () => {
    console.log(`TAGT Backend running on port ${PORT}`);
});
