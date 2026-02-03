import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "TAGT Property Management API",
        version: "1.0.0",
        description: "API documentation for TAGT backend"
    },
    servers: [
        {
            url: process.env.API_BASE_URL || "http://localhost:5000/api",
            description: "API Server"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    },
    security: [{ bearerAuth: [] }]
};

const options = {
    swaggerDefinition,
    apis: [
        "./routes/*.js",
        "./controllers/*.js",
        "./models/*.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
