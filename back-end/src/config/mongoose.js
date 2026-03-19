import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    // const uri = "mongodb+srv://ChanPotter:Password123!@cluster0.jdsmxen.mongodb.net/?appName=Cluster0";
    const dbName = process.env.DATABASE_NAME;

    if (!uri) {
      throw new Error("MONGODB_URI_ATLAS is not defined in .env file");
    }

    await mongoose.connect(uri, {
      dbName: dbName,
    });
    // await mongoose.connect(uri);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;
