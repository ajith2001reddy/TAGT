import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let replSet;

export const connect = async () => {
    if (mongoose.connection.readyState === 1) return;

    if (!replSet) {
        replSet = await MongoMemoryReplSet.create({
            replSet: { storageEngine: 'wiredTiger', count: 1 }
        });
        const uri = replSet.getUri();
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
        });
    }
};

export const closeDatabase = async () => {
    if (replSet) {
        await mongoose.connection.close();
        await replSet.stop();
    }
};

export const clearDatabase = async () => {
    if (mongoose.connection.readyState === 0) return;
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
};
