import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { parsePagination } from '@/lib/pagination';
import { createSchemeSchema } from '@/validators/schemeValidators';
import { createNewScheme, listSchemes } from '@/services/schemeService';

export const GET = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'scheme.view');

  const { page, limit } = parsePagination(request);
  const result = await listSchemes(ctx.account.id, page, limit);
  return NextResponse.json(result);
});

export const POST = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'scheme.create');

  const body = await request.json();
  const input = parseWithZod(createSchemeSchema, body);

  const scheme = await createNewScheme(ctx.account.id, ctx.user.id, input);
  return NextResponse.json({ scheme }, { status: 201 });
});
