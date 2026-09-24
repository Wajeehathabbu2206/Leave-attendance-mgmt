import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Attendance.syncIndexes();
  console.log('MongoDB connected');
}
