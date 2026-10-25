const mongoose = require("mongoose");

async function connectDB() {
    const mongoURI = process.env.MONGO_URI;

    if(!mongoURI)
    {
        throw new Error("MongoDB URI is not defined in environment variables");
    }

    await mongoose.connect(mongoURI);

}

module.exports = connectDB;