import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { forgotPasswordSchema } from '@/validators/authValidators';
import { requestPasswordReset } from '@/services/authService';

export const POST = withErrorHandler(async (request: Request) => {
  await enforceRateLimit('auth-forgot-password', getClientIp(request), {
    limit: 5,
    windowSeconds: 60,
  });
  await connectDB();

  const body = await request.json();
  const { email } = parseWithZod(forgotPasswordSchema, body);

  await requestPasswordReset(email);

  return NextResponse.json({ success: true });
});
