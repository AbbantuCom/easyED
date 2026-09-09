import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { updateRoleSchema } from '@/validators/roleValidators';
import { deleteAccountRole, updateAccountRole } from '@/services/roleService';

interface Params {
  params: Promise<{ id: string }>;
}

export const PATCH = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'role.manage');

  const body = await request.json();
  const input = parseWithZod(updateRoleSchema, body);

  const role = await updateAccountRole(id, ctx.account.id, input);
  return NextResponse.json({ role });
});

export const DELETE = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'role.manage');

  await deleteAccountRole(id, ctx.account.id);
  return NextResponse.json({ success: true });
});
