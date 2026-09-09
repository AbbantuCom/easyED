import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { setSessionCookie } from '@/lib/cookies';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { loginSchema } from '@/validators/authValidators';
import { login } from '@/services/authService';

export const POST = withErrorHandler(async (request: Request) => {
  await enforceRateLimit('auth-login', getClientIp(request), { limit: 10, windowSeconds: 60 });
  await connectDB();

  const body = await request.json();
  const { email, password } = parseWithZod(loginSchema, body);

  const { user, account, permissions, token } = await login(email, password);

  const response = NextResponse.json({ user, account, permissions });
  setSessionCookie(response, token);
  return response;
});
