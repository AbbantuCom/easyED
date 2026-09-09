import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { createRoleSchema } from '@/validators/roleValidators';
import { createAccountRole, listRoles } from '@/services/roleService';

export const GET = withErrorHandler(async (request: Request) => {
  await connectDB();
  const { account } = await getAuthenticatedUser(request);
  const roles = await listRoles(account.id);
  return NextResponse.json({ roles });
});

export const POST = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'role.manage');

  const body = await request.json();
  const input = parseWithZod(createRoleSchema, body);

  const role = await createAccountRole(ctx.account.id, input);
  return NextResponse.json({ role }, { status: 201 });
});
