export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
};

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || err.statusCode || 500;

    res.status(status).json({
        success: false,
        message: err.message || "Server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};
