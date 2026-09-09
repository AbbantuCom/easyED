import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { updateUserRoleSchema } from '@/validators/userValidators';
import { changeStaffRole, removeStaff } from '@/services/userService';

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'role.manage');

  const body = await request.json();
  const { roleId } = parseWithZod(updateUserRoleSchema, body);

  const user = await changeStaffRole(id, ctx.account.id, roleId, ctx.user.id);
  return NextResponse.json({ user });
});

export const DELETE = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'staff.remove');

  await removeStaff(id, ctx.account.id, ctx.user.id);
  return NextResponse.json({ success: true });
});
