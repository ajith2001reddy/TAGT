require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// DB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later"
});

app.use(limiter);

// Body parser
app.use(express.json());

// CORS (production-safe)
app.use(
    cors({
        origin: "*", // later restrict to frontend domain
        credentials: true
    })
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/resident", require("./routes/resident"));

// Error handler
app.use(require("./middleware/errorHandler"));

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
