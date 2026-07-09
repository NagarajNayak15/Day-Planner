import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(uri?: string): Promise<void> {
  const connectionString = uri ?? env.mongoUri;
  try {
    await mongoose.connect(connectionString);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', (error as Error).message);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
