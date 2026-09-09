import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { listSchemeWeekOptions } from '@/services/schemeService';

export const GET = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'scheme.view');

  const options = await listSchemeWeekOptions(ctx.account.id);
  return NextResponse.json({ options });
});
