import mongoose from 'mongoose';
import { env } from './env';

export const connectMongoDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('💚 Connected to MongoDB successfully.');
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed. Falling back to local offline in-memory cache/mocking.', error);
  }
};
