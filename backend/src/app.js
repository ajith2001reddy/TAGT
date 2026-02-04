const allowedOrigins = [
    "https://tagt.website",
    "https://www.tagt.website"
];

app.use(
    cors({
        origin: (origin, callback) => {
            // allow server-to-server & health checks
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);
