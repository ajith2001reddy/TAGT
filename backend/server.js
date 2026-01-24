require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ ONLY AUTH ROUTE
app.use("/api/auth", require("./routes/auth"));

app.listen(PORT, () => {
    console.log(`TAGT Backend running on port ${PORT}`);
});
