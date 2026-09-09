import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { setSessionCookie } from '@/lib/cookies';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { registerSchema } from '@/validators/authValidators';
import { registerAccount } from '@/services/authService';

export const POST = withErrorHandler(async (request: Request) => {
  await enforceRateLimit('auth-register', getClientIp(request), { limit: 5, windowSeconds: 60 });
  await connectDB();

  const body = await request.json();
  const input = parseWithZod(registerSchema, body);

  const { user, account, token } = await registerAccount(input);

  const response = NextResponse.json({ user, account }, { status: 201 });
  setSessionCookie(response, token);
  return response;
});
