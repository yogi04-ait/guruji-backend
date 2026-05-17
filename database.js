import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || "20", 10),

      serverSelectionTimeoutMS: parseInt(
        process.env.MONGO_SERVER_SELECTION_MS || "5000",
        10
      ),

      socketTimeoutMS: parseInt(
        process.env.MONGO_SOCKET_TIMEOUT_MS || "45000",
        10
      ),

      family: 4,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    process.exit(1);
  }
};

export default connectDB;