import { jest } from '@jest/globals';
import mongoose from "mongoose";

import User from '../../src/models/User.js';
import Property from '../../src/models/Property.js';
import Bed from '../../src/models/Bed.js';

describe("Rooms Real Transaction Suite", () => {
    let owner, property, dbSetup, fixtures;

    beforeAll(async () => {
        dbSetup = await import('../dbSetup.js');
        fixtures = await import('../fixtures.js');
        await dbSetup.connect();

        owner = await fixtures.createMockOwner();
        property = await fixtures.createMockProperty(owner._id);

        owner = await User.findById(owner._id).lean();
    });

    afterAll(async () => {
        await dbSetup.closeDatabase();
    });

    it("should successfully create a room and generate its beds in a real transaction", async () => {
        const { createRoom } = await import('../../src/controllers/v2/roomController.js');

        const req = {
            body: {
                roomNumber: "701",
                rent: 35000,
                totalBeds: 2,
                propertyId: property._id.toString()
            },
            user: { ...owner, propertyId: property._id.toString() }
        };

        const res = {
            statusCode: 0,
            body: {},
            status: function (code) { this.statusCode = code; return this; },
            json: function (data) { this.body = data; return this; }
        };

        const next = jest.fn((err) => {
            if (err) console.error("NEXT ERR:", err.message);
        });

        await createRoom(req, res, next);

        if (res.statusCode !== 201) {
            console.error("CREATE ROOM FAILED:", res.body);
        }

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.roomNumber).toBe("701");

        const createdBeds = await Bed.find({ roomId: res.body.data._id });
        expect(createdBeds.length).toBe(2);
    });
});
