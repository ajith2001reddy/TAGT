import { jest } from '@jest/globals';
import mongoose from "mongoose";
import User from '../../src/models/User.js';
import Property from '../../src/models/Property.js';
import admin from '../../src/config/firebase.js';

describe("Resident Deletion Multi-Tenancy Suite", () => {
    let owner1, owner2, property1, property2, resident1, resident2, dbSetup, fixtures;

    beforeAll(async () => {
        dbSetup = await import('../dbSetup.js');
        fixtures = await import('../fixtures.js');
        await dbSetup.connect();

        // Setup Owner 1 and Property 1 with a resident
        owner1 = await fixtures.createMockOwner();
        property1 = await fixtures.createMockProperty(owner1._id);
        // Add propertyId to owner1 for buildPropertyFilter to work
        await User.findByIdAndUpdate(owner1._id, { propertyIds: [property1._id] });

        resident1 = await fixtures.createMockResident(property1._id, owner1._id);

        // Setup Owner 2 and Property 2 with a resident
        owner2 = await User.create({
            name: "Other Owner",
            email: "other@example.com",
            role: "owner"
        });
        property2 = await fixtures.createMockProperty(owner2._id);
        await User.findByIdAndUpdate(owner2._id, { propertyIds: [property2._id] });

        resident2 = await fixtures.createMockResident(property2._id, owner2._id);

        // Mock Firebase deleteUser
        jest.spyOn(admin.auth(), 'deleteUser').mockResolvedValue(true);
    });

    afterAll(async () => {
        await dbSetup.closeDatabase();
    });

    it("should allow owner1 to delete their own resident1", async () => {
        const { deleteResident } = await import('../../src/controllers/v2/residentController.js');

        const ownerUser = await User.findById(owner1._id).lean();
        const req = {
            params: { id: resident1._id.toString() },
            user: { ...ownerUser, propertyIds: [property1._id] }
        };

        const res = {
            statusCode: 200, // Default for express
            body: {},
            status: function (code) { this.statusCode = code; return this; },
            json: function (data) { this.body = data; return this; }
        };

        const next = jest.fn((err) => {
            if (err) console.error("DELETE RESIDENT ERROR:", err);
        });

        await deleteResident(req, res, next);

        if (next.mock.calls.length > 0) {
            console.error("Next was called with:", next.mock.calls[0][0]);
        }

        expect(res.body.success).toBe(true);

        const deletedResident = await User.findOne({ _id: resident1._id, isDeleted: true });
        expect(deletedResident).not.toBeNull();
        expect(deletedResident.isActive).toBe(false);
    });

    it("should NOT allow owner1 to delete resident2 from owner2's property", async () => {
        const { deleteResident } = await import('../../src/controllers/v2/residentController.js');

        const ownerUser = await User.findById(owner1._id).lean();
        const req = {
            params: { id: resident2._id.toString() },
            user: { ...ownerUser, propertyIds: [property1._id] }
        };

        const res = {
            statusCode: 200,
            body: {},
            status: function (code) { this.statusCode = code; return this; },
            json: function (data) { this.body = data; return this; }
        };

        const next = jest.fn();

        await deleteResident(req, res, next);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);

        const notDeletedResident = await User.findById(resident2._id);
        expect(notDeletedResident.isDeleted).toBe(false);
    });
});
