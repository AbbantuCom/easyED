import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { updateSchemeWeekSchema } from '@/validators/schemeValidators';
import { editSchemeWeek, removeSchemeWeek } from '@/services/schemeService';

interface Params {
  params: Promise<{ id: string; weekId: string }>;
}

export const PATCH = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id, weekId } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'scheme.edit');

  const body = await request.json();
  const input = parseWithZod(updateSchemeWeekSchema, body);

  const week = await editSchemeWeek(id, weekId, ctx.account.id, input);
  return NextResponse.json({ week });
});

export const DELETE = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id, weekId } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'scheme.edit');

  await removeSchemeWeek(id, weekId, ctx.account.id);
  return NextResponse.json({ success: true });
});
