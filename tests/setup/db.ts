import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer | undefined;

export async function startTestDb(): Promise<void> {
  process.env.JWT_SECRET ??= 'test-secret-'.repeat(8);
  process.env.JWT_EXPIRY_DAYS ??= '7';
  process.env.INVITE_TOKEN_EXPIRY_HOURS ??= '72';
  process.env.OTP_EXPIRY_MINUTES ??= '15';
  process.env.NEXT_PUBLIC_APP_URL ??= 'http://localhost:3000';

  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const { connectDB } = await import('@/lib/db');
  await connectDB();
}

export async function clearTestDb(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

export async function stopTestDb(): Promise<void> {
  await mongoose.disconnect();
  await mongod?.stop();
}
