import request from "supertest";
import app from "../../src/app.js";

describe("Health Endpoint", () => {
    it("should return 200 OK", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual("OK");
    });
});
