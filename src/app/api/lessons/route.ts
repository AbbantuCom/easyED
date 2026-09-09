import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { parsePagination } from '@/lib/pagination';
import { createLessonSchema } from '@/validators/lessonValidators';
import { createNewLesson, listLessons } from '@/services/lessonService';

export const GET = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'lesson.view');

  const { page, limit } = parsePagination(request);
  const result = await listLessons(ctx.account.id, page, limit);
  return NextResponse.json(result);
});

export const POST = withErrorHandler(async (request: Request) => {
  await connectDB();
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'lesson.create');

  const body = await request.json();
  const input = parseWithZod(createLessonSchema, body);

  const lesson = await createNewLesson(ctx.account.id, ctx.user.id, input);
  return NextResponse.json({ lesson }, { status: 201 });
});
