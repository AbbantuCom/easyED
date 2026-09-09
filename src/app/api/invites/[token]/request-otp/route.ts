import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler } from '@/lib/errors';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { requestInviteOtp } from '@/services/inviteService';

interface Params {
  params: Promise<{ token: string }>;
}

export const POST = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { token } = await context.params;

  await enforceRateLimit('invite-request-otp', `${getClientIp(request)}:${token}`, {
    limit: 5,
    windowSeconds: 60,
  });

  await requestInviteOtp(token);
  return NextResponse.json({ success: true });
});
