import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    if (err.message?.includes("querySrv ECONNREFUSED")) {
      throw new Error(
        "Cannot reach MongoDB Atlas. Check internet/DNS, Atlas cluster status, and IP whitelist (Network Access → allow your IP or 0.0.0.0/0 for dev)."
      );
    }
    throw err;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});
