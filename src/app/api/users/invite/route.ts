import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { enforceRateLimit } from '@/lib/rate-limit';
import { inviteUserSchema } from '@/validators/userValidators';
import { sendStaffInvite } from '@/services/inviteService';

export const POST = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'staff.invite');

  await enforceRateLimit('staff-invite', ctx.account.id, { limit: 20, windowSeconds: 60 });

  const body = await request.json();
  const { email, roleId } = parseWithZod(inviteUserSchema, body);

  await sendStaffInvite(ctx.account.id, email, roleId);

  return NextResponse.json({ success: true }, { status: 201 });
});
