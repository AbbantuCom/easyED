import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { changePasswordSchema } from '@/validators/authValidators';
import { changePassword } from '@/services/authService';

export const POST = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);

  const body = await request.json();
  const { currentPassword, newPassword } = parseWithZod(changePasswordSchema, body);

  await changePassword(ctx.user.id, currentPassword, newPassword);
  return NextResponse.json({ success: true });
});
