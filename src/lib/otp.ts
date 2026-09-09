import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const OTP_SALT_ROUNDS = 10;

export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, OTP_SALT_ROUNDS);
}

export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
