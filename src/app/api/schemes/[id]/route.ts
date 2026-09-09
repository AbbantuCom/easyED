import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { updateSchemeSchema } from '@/validators/schemeValidators';
import { deleteScheme, getSchemeWithWeeks, updateScheme } from '@/services/schemeService';

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'scheme.view');

  const result = await getSchemeWithWeeks(id, ctx.account.id);
  return NextResponse.json(result);
});

export const PATCH = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'scheme.edit');

  const body = await request.json();
  const input = parseWithZod(updateSchemeSchema, body);

  const scheme = await updateScheme(id, ctx.account.id, input);
  return NextResponse.json({ scheme });
});

export const DELETE = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'scheme.delete');

  await deleteScheme(id, ctx.account.id, ctx.user.id);
  return NextResponse.json({ success: true });
});
