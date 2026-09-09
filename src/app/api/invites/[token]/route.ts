import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler } from '@/lib/errors';
import { getInviteeEmailByToken } from '@/services/inviteService';

interface Params {
  params: Promise<{ token: string }>;
}

export const GET = withErrorHandler<Params>(async (_request, context) => {
  await connectDB();
  const { token } = await context.params;
  const email = await getInviteeEmailByToken(token);
  return NextResponse.json({ email });
});
