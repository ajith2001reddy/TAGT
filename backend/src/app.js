import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import residentRoutes from './routes/resident.js'; // Example route
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { swaggerSpec, swaggerUi } from './swagger.js'; // Import Swagger

const app = express();

// Security Headers
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests, please try again later."
});
app.use(limiter);

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Setup
app.use('/api/residents', residentRoutes); // Integrate resident routes

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
