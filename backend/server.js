require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors({
    origin: [
        "https://tagt-if9f-or155ifph-ajith2001reddys-projects.vercel.app"
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/resident", require("./routes/resident"));


app.listen(5000, () => {
    console.log("TAGT Backend running on port 5000");
});
