import request from "supertest";
import app from "../../src/app.js";

describe("Health Check & Infrastructure Integration", () => {
    it("should return 200 OK for the health check endpoint", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("status", "OK");
    });

    it("should include security headers from Helmet", async () => {
        const res = await request(app).get("/");
        expect(res.headers).toHaveProperty("x-dns-prefetch-control");
        expect(res.headers).toHaveProperty("x-frame-options");
    });
});
