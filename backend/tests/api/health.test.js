import { describe, it, expect, beforeAll } from "@jest/globals";
import request from "supertest";

describe("Health Endpoint", () => {
    let app;

    beforeAll(async () => {
        app = (await import("../../src/app.js")).default;
    });

    it("should return 200 OK", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual("OK");
    });
});
