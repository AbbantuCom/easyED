import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler, parseWithZod } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { requirePermission } from '@/lib/permissions';
import { updateLessonSchema } from '@/validators/lessonValidators';
import { deleteLesson, getLesson, updateLesson } from '@/services/lessonService';

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'lesson.view');

  const lesson = await getLesson(id, ctx.account.id);
  return NextResponse.json({ lesson });
});

export const PATCH = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'lesson.edit');

  const body = await request.json();
  const input = parseWithZod(updateLessonSchema, body);

  const lesson = await updateLesson(id, ctx.account.id, input);
  return NextResponse.json({ lesson });
});

export const DELETE = withErrorHandler<Params>(async (request, context) => {
  await connectDB();
  const { id } = await context.params;
  const ctx = await getAuthenticatedUser(request);
  requirePermission(ctx, 'lesson.delete');

  await deleteLesson(id, ctx.account.id, ctx.user.id);
  return NextResponse.json({ success: true });
});
