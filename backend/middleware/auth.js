const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json("No token, access denied");
    }

    try {
        const decoded = jwt.verify(token, "tagt_secret");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json("Token invalid");
    }
};
