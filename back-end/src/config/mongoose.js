import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
    const dbName = process.env.DATABASE_NAME;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    // Disable mongoose operation buffering so queries fail fast if not connected
    mongoose.set("bufferCommands", false);

    await mongoose.connect(uri, dbName ? { dbName } : undefined);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message || error);
    process.exit(1);
  }
};

export default connectDB;
