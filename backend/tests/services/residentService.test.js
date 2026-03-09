import { jest } from '@jest/globals';
import mongoose from "mongoose";

describe('ResidentService', () => {
    let residentService, User, Room, Payment, Property, dbSetup, fixtures;

    beforeAll(async () => {
        dbSetup = await import('../dbSetup.js');
        await dbSetup.connect();
        fixtures = await import('../fixtures.js');

        // Dynamic imports for the actual service and models
        residentService = (await import('../../src/services/residentService.js')).default;
        User = (await import('../../src/models/User.js')).default;
        Room = (await import('../../src/models/Room.js')).default;
        Payment = (await import('../../src/models/Payment.js')).default;
        Property = (await import('../../src/models/Property.js')).default;
    });

    afterAll(async () => {
        await dbSetup.closeDatabase();
    });

    beforeEach(async () => {
        await mongoose.connection.dropDatabase();
        jest.clearAllMocks();
    });

    describe('approveResident', () => {
        it('should approve a resident', async () => {
            const owner = await fixtures.createMockOwner();
            const property = await fixtures.createMockProperty(owner._id);
            const resident = await User.create({
                name: "John Doe",
                email: "john@test.com",
                role: "resident",
                status: "pending",
                propertyId: property._id,
                firebaseUid: "test-uid"
            });

            const result = await residentService.approveResident(resident._id, owner._id);

            expect(result.status).toBe('approved');
            const updated = await User.findById(resident._id);
            expect(updated.status).toBe('approved');
        });
    });

    describe('createResidentWorkflow', () => {
        it('should create a resident and a first bill', async () => {
            const owner = await fixtures.createMockOwner();
            const property = await fixtures.createMockProperty(owner._id);
            const room = await Room.create({
                roomNumber: "R1",
                rent: 1000,
                totalBeds: 2,
                propertyId: property._id
            });

            const residentData = {
                name: "Jane Smith",
                email: "jane@test.com",
                propertyId: property._id.toString(),
                roomId: room._id.toString(),
                phoneNumber: "1234567890",
                password: "password123"
            };

            const { resident } = await residentService.createResidentWorkflow(residentData);

            expect(resident.name).toBe("Jane Smith");
            expect(resident.email).toBe("jane@test.com");
            expect(resident.roomId.toString()).toBe(room._id.toString());

            // Check if payment was generated
            const payment = await Payment.findOne({ resident: resident._id });
            expect(payment).toBeDefined();
            expect(payment.amount).toBe(1000);
            expect(payment.room.toString()).toBe(room._id.toString());
        });
    });
});
