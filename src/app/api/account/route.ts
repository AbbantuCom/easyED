import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { updateAccountNameSchema } from '@/validators/accountValidators';
import { renameAccount } from '@/services/accountService';

export const PATCH = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'account.manage');

  const body = await request.json();
  const { name } = parseWithZod(updateAccountNameSchema, body);

  const account = await renameAccount(ctx.account.id, name);
  return NextResponse.json({ account });
});
