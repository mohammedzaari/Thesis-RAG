/** MongoDB connection management (Mongoose). */
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.info('[db] Connected to MongoDB');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
