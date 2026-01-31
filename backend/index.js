require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: [
            "https://tagt.website",
            "https://www.tagt.website"
        ],
        credentials: true
    })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (email !== "admin@test.com" || password !== "123456") {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
        token: "demo-token",
        role: "admin"
    });
});

app.listen(PORT, () => {
    console.log("Backend running on port", PORT);
});
