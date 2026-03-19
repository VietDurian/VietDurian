import mongoose from "mongoose";
require("dotenv").config();

const connectDB = async () => {
  try {
    const uri = "mongodb+srv://ChanPotter:Password123!@cluster0.jdsmxen.mongodb.net/?appName=Cluster0";
    const dbName = process.env.DATABASE_NAME;

    if (!uri) {
      throw new Error("MONGODB_URI_ATLAS is not defined in .env file");
    }

    await mongoose.connect(uri);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;