import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

const uri = process.env.MONGODB_URI as string;

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}