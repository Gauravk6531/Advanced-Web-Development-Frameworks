const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in the .env file.");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};

module.exports = connectDB;
