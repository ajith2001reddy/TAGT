import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/tagt").then(async () => {
    const properties = await mongoose.connection.db.collection('properties').find({}).toArray();
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log("PROPERTIES\n", JSON.stringify(properties, null, 2));
    console.log("USERS\n", JSON.stringify(users.map(u => ({_id: u._id, name: u.name, role: u.role, email: u.email})), null, 2));
    process.exit(0);
});
