import request from "supertest";
import app from "../../src/app.js";
import { connect, closeDatabase, clearDatabase } from "../dbSetup.js";

describe("Auth Endpoints", () => {

    beforeAll(async () => {
        await connect();
    });

    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    describe("POST /api/v2/auth/login", () => {
        it("should return 400 if email is missing", async () => {
            const res = await request(app)
                .post("/api/v2/auth/login")
                .send({ password: "password123" });

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("POST /api/v2/auth/register-owner", () => {
        it("should return 201 if valid owner", async () => {
            const res = await request(app)
                .post("/api/v2/auth/register-owner")
                .send({
                    name: "Test Owner",
                    email: "owner@example.com",
                    password: "password123"
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe("owner@example.com");
        });

        it("should return 200 with message if user already exists (idempotent)", async () => {
            const payload = {
                name: "Test Owner",
                email: "owner@example.com",
                password: "password123"
            };

            await request(app).post("/api/v2/auth/register-owner").send(payload);

            const res = await request(app)
                .post("/api/v2/auth/register-owner")
                .send(payload);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain("exists");
        });
    });
});
