import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { resetPasswordSchema } from '@/validators/authValidators';
import { resetPassword } from '@/services/authService';

export const POST = withErrorHandler(async (request: Request) => {
  await connectDB();

  const body = await request.json();
  const { token, newPassword } = parseWithZod(resetPasswordSchema, body);

  await resetPassword(token, newPassword);

  return NextResponse.json({ success: true });
});
