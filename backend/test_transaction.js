import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

async function run() {
    const mongod = await MongoMemoryReplSet.create({
        replSet: { storageEngine: "wiredTiger", count: 1 }
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    const User = mongoose.model('User', new mongoose.Schema({ name: String, isDeleted: Boolean }));

    const user = await User.create({ name: 'Test', isDeleted: false });
    console.log('User created:', user._id);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log('Starting transaction...');
        const found = await User.findOne({ _id: user._id }).session(session);
        console.log('User found in transaction:', found.name);
        
        found.isDeleted = true;
        await found.save({ session });
        console.log('User saved in transaction');

        await session.commitTransaction();
        console.log('Transaction committed');
    } catch (err) {
        console.error('Transaction failed:', err);
        await session.abortTransaction();
    } finally {
        session.endSession();
        await mongoose.disconnect();
        await mongod.stop();
    }
}

run().catch(console.error);
