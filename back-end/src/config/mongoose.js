import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;

    const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
    const dbName = process.env.DATABASE_NAME || "VietDurian_DB";

    if (!uri) {
      throw new Error("MONGODB_URI_ATLAS or MONGODB_URI is not defined");
    }

    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(`[MongoDB] Connected successfully (db: ${dbName})`);
  } catch (error) {
    console.error("[MongoDB] Connection failed", {
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });
    throw error;
  }
};

export default connectDB;
