import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const connection: ConnectionObject = {}

async function dbConnect() {
    if (connection.isConnected) {
        console.log("Using existing connection");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URL || '', {});
        connection.isConnected = db.connections[0].readyState;
        console.log("New connection created");
    } catch (error) {
        console.error("Error connecting to database", error);
        process.exit(1);
    }
}

export default dbConnect;