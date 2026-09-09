import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { setSessionCookie } from '@/lib/cookies';
import { acceptInviteSchema } from '@/validators/inviteValidators';
import { acceptInvite } from '@/services/inviteService';

interface Params {
  params: Promise<{ token: string }>;
}

export const POST = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { token } = await context.params;

  const body = await request.json();
  const input = parseWithZod(acceptInviteSchema, body);

  const { user, account, permissions, token: sessionToken } = await acceptInvite(token, input);

  const response = NextResponse.json({ user, account, permissions });
  setSessionCookie(response, sessionToken);
  return response;
});
