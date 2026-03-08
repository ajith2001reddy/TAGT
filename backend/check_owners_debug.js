import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Subscription from './src/models/Subscription.js';

dotenv.config();

async function checkOwners() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const activeOwners = await User.find({ role: 'owner' }).lean();
        console.log(`Active Owners Count: ${activeOwners.length}`);
        activeOwners.forEach(o => console.log(` - ID: ${o._id}, Name: ${o.name}, Email: ${o.email}, isDeleted: ${o.isDeleted}`));

        const allSubs = await Subscription.find({}).lean();
        console.log(`Total Subscriptions: ${allSubs.length}`);

        for (const sub of allSubs) {
            const owner = await User.findById(sub.owner).lean();
            console.log(` - Sub ID: ${sub._id}, Owner ID: ${sub.owner}, Owner Found: ${!!owner}, Plan: ${sub.plan}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkOwners();
