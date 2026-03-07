import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
process.env.ENCRYPTION_SECRET = 'test_secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/tagt-test';
process.env.ADMIN_KEY = 'test_admin_key';

// Mock Redis to prevent connection hangs
jest.unstable_mockModule('ioredis', () => ({
    default: class Redis {
        constructor() { this.status = 'ready'; }
        on() { return this; }
        quit() { return Promise.resolve(); }
        disconnect() { return Promise.resolve(); }
    }
}));

// Mock BullMQ to prevent queue initialization issues
jest.unstable_mockModule('bullmq', () => ({
    Queue: class Queue {
        constructor() { }
        add() { return Promise.resolve(); }
        close() { return Promise.resolve(); }
    },
    Worker: class Worker {
        constructor() { }
        on() { }
        close() { return Promise.resolve(); }
    }
}));

// Mock node-cron to avoid open handles
jest.unstable_mockModule('node-cron', () => ({
    default: {
        schedule: jest.fn(() => ({
            start: jest.fn(),
            stop: jest.fn()
        }))
    }
}));
