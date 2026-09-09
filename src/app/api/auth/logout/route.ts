import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors';
import { clearSessionCookie } from '@/lib/cookies';

export const POST = withErrorHandler(async () => {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
});
