module.exports = (err, req, res, next) => {
    console.error("❌ ERROR:", err.message);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server error"
    });
};
