import { jest } from '@jest/globals';
import ResidentService from '../../src/services/residentService.js';
import User from '../../src/models/User.js';
import eventBus from '../../src/events/publisher.js';

// Mock the dependencies
jest.unstable_mockModule('../../src/models/User.js', () => ({
    default: {
        create: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findOne: jest.fn()
    }
}));

jest.unstable_mockModule('../../src/events/publisher.js', () => ({
    default: {
        publish: jest.fn()
    }
}));

describe('ResidentService', () => {
    let residentService;

    beforeEach(() => {
        residentService = new ResidentService(User);
        jest.clearAllMocks();
    });

    describe('approveResident', () => {
        it('should approve a resident and publish an event', async () => {
            const mockResidentId = '65b1234567890abcdef12345';
            const mockResident = {
                _id: mockResidentId,
                name: 'John Doe',
                email: 'john@example.com',
                status: 'pending',
                isActive: false
            };

            // Mock implementation
            User.findByIdAndUpdate.mockResolvedValue({
                ...mockResident,
                status: 'active',
                isActive: true
            });

            const result = await residentService.approveResident(mockResidentId);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                mockResidentId,
                { status: 'active', isActive: true },
                { new: true }
            );

            expect(eventBus.publish).toHaveBeenCalledWith('resident.approved', expect.objectContaining({
                residentId: mockResidentId
            }));

            expect(result.status).toBe('active');
            expect(result.isActive).toBe(true);
        });

        it('should throw an error if resident is not found', async () => {
            User.findByIdAndUpdate.mockResolvedValue(null);

            await expect(residentService.approveResident('invalid-id'))
                .rejects.toThrow('Resident not found');
        });
    });

    describe('createResidentWorkflow', () => {
        it('should create a resident and publish an event', async () => {
            const residentData = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                propertyId: 'prop123'
            };

            User.create.mockResolvedValue({
                _id: 'new-id',
                ...residentData
            });

            const result = await residentService.createResidentWorkflow(residentData);

            expect(User.create).toHaveBeenCalledWith(expect.objectContaining(residentData));
            expect(eventBus.publish).toHaveBeenCalledWith('resident.created', expect.objectContaining({
                residentId: 'new-id'
            }));
            expect(result._id).toBe('new-id');
        });
    });
});
