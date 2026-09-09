import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { createSchemeWeekSchema } from '@/validators/schemeValidators';
import { addSchemeWeek } from '@/services/schemeService';

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'scheme.edit');

  const body = await request.json();
  const input = parseWithZod(createSchemeWeekSchema, body);

  const week = await addSchemeWeek(id, ctx.account.id, input);
  return NextResponse.json({ week }, { status: 201 });
});
