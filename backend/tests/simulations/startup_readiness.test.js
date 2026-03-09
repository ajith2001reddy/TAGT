import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { generateMockToken } from "../fixtures.js";

describe("Startup Readiness Simulation", () => {
    let app, User, Property, Room, Payment;
    let ownerToken, residentToken, ownerId, propertyId, roomId, residentId;

    beforeAll(async () => {
        // Dynamic imports to ensure setup.js environment is ready
        app = (await import("../../src/app.js")).default;
        User = (await import("../../src/models/User.js")).default;
        Property = (await import("../../src/models/Property.js")).default;
        Room = (await import("../../src/models/Room.js")).default;
        Payment = (await import("../../src/models/Payment.js")).default;

        // Setup Owner
        const owner = await User.create({
            name: "Audit Owner",
            email: `owner_${Date.now()}@test.com`,
            role: "owner",
            firebaseUid: `uid_${Date.now()}`
        });
        ownerId = owner._id;
        ownerToken = generateMockToken(owner);
    });

    afterAll(async () => {
        await User.deleteMany({ email: /@test.com/ });
        await Property.deleteMany({ name: "Audit Property" });
        await Room.deleteMany({ roomNumber: "AUDIT-101" });
        await Payment.deleteMany({ propertyId });
    });

    it("Step 1: Owner Creates Property", async () => {
        const res = await request(app)
            .post("/api/v2/properties")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                name: "Audit Property",
                type: "pg",
                address: "Security Audit Lane",
                city: "Stabalized City"
            });

        expect(res.status).toBe(201);
        propertyId = res.body.data._id;
        expect(res.body.data.ownerId).toBe(ownerId.toString());

        // 🔐 Context Fix: Owner must have a "selected" propertyId to create rooms/beds in V2
        await User.findByIdAndUpdate(ownerId, { propertyId });
    });

    it("Step 2: Owner Adds Room", async () => {
        const res = await request(app)
            .post("/api/v2/rooms")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                propertyId,
                roomNumber: "AUDIT-101",
                totalBeds: 2,
                rent: 15000
            });

        expect(res.status).toBe(201);
        roomId = res.body.data._id;
    });

    it("Step 3: Owner Registers Resident (Auto-assign to room & first bill)", async () => {
        const res = await request(app)
            .post("/api/v2/residents")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                name: "Audit Resident",
                email: `res_${Date.now()}@test.com`,
                propertyId,
                roomId,
                phoneNumber: "1234567890"
            });

        expect(res.status).toBe(201);
        residentId = res.body.data._id;

        // Verify User fields
        const resident = await User.findById(residentId);
        expect(resident.propertyId.toString()).toBe(propertyId.toString());
        expect(resident.roomId.toString()).toBe(roomId.toString());
        expect(resident.ownerId.toString()).toBe(ownerId.toString());
    });

    it("Step 4: Verify First Bill was generated", async () => {
        const bills = await Payment.find({ resident: residentId });
        expect(bills.length).toBe(1);
        expect(bills[0].amount).toBe(15000);
        expect(bills[0].propertyId.toString()).toBe(propertyId.toString());
    });

    it("Step 5: Security Boundary Check (Owner A cannot see Owner B's data)", async () => {
        const otherOwner = await User.create({
            name: "Hacker Owner",
            email: `hacker_${Date.now()}@test.com`,
            role: "owner",
            firebaseUid: `uid_hacker_${Date.now()}`
        });
        const hackerToken = generateMockToken(otherOwner);

        const res = await request(app)
            .get(`/api/v2/properties/${propertyId}`)
            .set("Authorization", `Bearer ${hackerToken}`);

        // Should be 404 or 403 because of tenant isolation plugin
        expect([403, 404]).toContain(res.status);
    });
});
