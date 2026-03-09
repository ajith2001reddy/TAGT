import { jest } from "@jest/globals";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

globalThis.jest = jest;

let mongod;

// 🟢 GLOBAL SETUP
beforeAll(async () => {
    // 1. Setup Mongo Memory Server (ReplSet for transaction support)
    mongod = await MongoMemoryReplSet.create({
        replSet: { storageEngine: "wiredTiger", count: 1 }
    });
    const uri = mongod.getUri();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    // 2. Set Test Environment Variables
    process.env.NODE_ENV = "test";
    process.env.MONGO_URI = uri; // Use the memory server URI
    process.env.REDIS_URL = "redis://localhost:6379";
    process.env.FIREBASE_PROJECT_ID = "test-project";
    process.env.FIREBASE_CLIENT_EMAIL = "test@example.com";
    process.env.FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----";
    process.env.ENCRYPTION_SECRET = "0123456789abcdef0123456789abcdef"; // 32 chars
    process.env.JWT_SECRET = "test-jwt-secret";
    process.env.STRIPE_SECRET_KEY = "sk_test_mock";
});

// 🔴 GLOBAL TEARDOWN
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
    if (mongod) {
        await mongod.stop();
    }
});

// ─────────────── MODULE MOCKS ───────────────

jest.unstable_mockModule("ioredis", () => ({
    default: class Redis {
        constructor() { this.status = "ready"; }
        on() { return this; }
        quit() { return Promise.resolve(); }
        disconnect() { return Promise.resolve(); }
        get() { return Promise.resolve(null); }
        set() { return Promise.resolve("OK"); }
        del() { return Promise.resolve(1); }
    }
}));

jest.unstable_mockModule("bullmq", () => ({
    Queue: class {
        constructor() { }
        add() { return Promise.resolve({ id: "job_id" }); }
        close() { return Promise.resolve(); }
    },
    Worker: class {
        constructor() { }
        on() { return this; }
        close() { return Promise.resolve(); }
    },
    QueueEvents: class {
        constructor() { }
        on() { return this; }
        close() { return Promise.resolve(); }
    }
}));

jest.unstable_mockModule("node-cron", () => ({
    default: {
        schedule: jest.fn(() => ({
            start: jest.fn(),
            stop: jest.fn()
        }))
    }
}));

jest.unstable_mockModule("firebase-admin", () => ({
    default: {
        auth: () => ({
            verifyIdToken: jest.fn((token) => {
                const uid = token.startsWith("mock_token_") ? token.replace("mock_token_", "") : "test-uid";
                return Promise.resolve({
                    uid,
                    email: "audit@test.com",
                    email_verified: true
                });
            }),
            createUser: jest.fn((data) => Promise.resolve({ uid: "new-user-uid", ...data })),
            generatePasswordResetLink: jest.fn(() => Promise.resolve("https://reset.link"))
        }),
        apps: [],
        initializeApp: jest.fn(),
        credential: { cert: jest.fn() }
    }
}));
