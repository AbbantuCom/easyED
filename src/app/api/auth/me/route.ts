import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { updateDisplayNameSchema } from '@/validators/authValidators';
import { updateOwnDisplayName } from '@/services/userService';

export const GET = withErrorHandler(async (request: Request) => {
  const { user, account, permissions } = await getAuthenticatedUser(request);
  return NextResponse.json({ user, account, permissions });
});

export const PATCH = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);

  const body = await request.json();
  const { displayName } = parseWithZod(updateDisplayNameSchema, body);

  const user = await updateOwnDisplayName(ctx.user.id, displayName);
  return NextResponse.json({ user });
});
