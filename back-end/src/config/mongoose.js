const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DATABASE_NAME;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(uri, {
      dbName: dbName,
    });

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
