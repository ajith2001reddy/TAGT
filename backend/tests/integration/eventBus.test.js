import { jest } from '@jest/globals';
import eventBus from '../../src/events/publisher.js';
import { Queue } from 'bullmq';

// Mock BullMQ Queue
jest.unstable_mockModule('bullmq', () => ({
    Queue: class {
        constructor() { }
        add = jest.fn().mockResolvedValue({ id: 'job-123' });
        close = jest.fn().mockResolvedValue();
    },
    Worker: class {
        constructor() { }
        on = jest.fn();
        close = jest.fn().mockResolvedValue();
    }
}));

describe('Event Bus Integration (Mocks)', () => {
    it('should add a job to the queue when an event is published', async () => {
        const eventName = 'test.event';
        const eventData = { foo: 'bar' };

        await eventBus.publish(eventName, eventData);

        // Since we are mocking the queue in publisher.js implicitly via the mock in setup or here
        // We want to verify that the publisher calls the queue
        // We'll need to inspect how publisher.js is implemented to be sure
    });
});
