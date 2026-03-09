import { jest } from '@jest/globals';
import mongoose from "mongoose";

describe("Automation Worker Integration Suite", () => {
    let dbSetup, fixtures;
    let User, Room, Payment, Property;
    let generateMonthlyRentPayments, applyLateFees;

    beforeAll(async () => {
        dbSetup = await import("../dbSetup.js");
        await dbSetup.connect();
        fixtures = await import("../fixtures.js");

        // Dynamic imports for models and services
        User = (await import("../../src/models/User.js")).default;
        Room = (await import("../../src/models/Room.js")).default;
        Payment = (await import("../../src/models/Payment.js")).default;
        Property = (await import("../../src/models/Property.js")).default;

        const automationService = await import("../../src/services/rentAutomationService.js");
        generateMonthlyRentPayments = automationService.generateMonthlyRentPayments;
        applyLateFees = automationService.applyLateFees;
    });

    afterAll(async () => {
        await dbSetup.closeDatabase();
    });

    beforeEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    test("should generate rent payments for active residents", async () => {
        const owner = await fixtures.createMockOwner();
        const property = await fixtures.createMockProperty(owner._id);

        const room = await Room.create({
            roomNumber: "101",
            rent: 5000,
            totalBeds: 1,
            propertyId: property._id
        });

        const resident = await User.create({
            name: "Test Resident",
            email: "res@test.com",
            role: "resident",
            isActive: true,
            propertyId: property._id,
            roomId: room._id
        });

        const targetDate = new Date(2026, 5, 1); // June 2026
        const result = await generateMonthlyRentPayments({ targetDate });

        expect(result.created).toBe(1);
        expect(result.month).toBe("2026-06");

        const payment = await Payment.findOne({ resident: resident._id });
        expect(payment).toBeDefined();
        expect(payment.amount).toBe(5000);
        expect(payment.status).toBe("pending");
        expect(payment.type).toBe("rent");
    });

    test("should apply late fees to overdue payments", async () => {
        const owner = await fixtures.createMockOwner();
        const property = await fixtures.createMockProperty(owner._id);

        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);

        const resident = await User.create({
            name: "Late Resident",
            email: "late@test.com",
            role: "resident",
            isActive: true,
            propertyId: property._id
        });

        const payment = await Payment.create({
            propertyId: property._id,
            resident: resident._id,
            amount: 1000,
            dueDate: pastDate,
            month: "2026-01",
            status: "pending",
            type: "rent"
        });

        const now = new Date();
        const result = await applyLateFees({ now, lateFeePercent: 0.1 });

        expect(result.lateFeeApplied).toBe(1);

        const updatedPayment = await Payment.findById(payment._id);
        expect(updatedPayment.status).toBe("overdue");
        expect(updatedPayment.lateFee).toBe(100);
        expect(updatedPayment.totalPayable).toBe(1100);
    });
});
