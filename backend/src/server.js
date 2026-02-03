import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db.js';
import winston from 'winston'; // Logger setup

// Load environment variables from .env file
dotenv.config();

const app = express();

// Set up winston for logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    transports: [
        new winston.transports.Console(),
    ]
});

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Listen to the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
