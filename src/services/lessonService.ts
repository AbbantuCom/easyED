import {
  createLesson,
  deleteLessonScoped,
  findLessonByIdScoped,
  listLessonsByAccount,
  updateLessonScoped,
} from '@/repositories/lessonRepository';
import { createAuditLog } from '@/repositories/auditLogRepository';
import type { CreateLessonInput, UpdateLessonInput } from '@/validators/lessonValidators';
import type { Lesson, Paginated } from '@/types';

export async function createNewLesson(
  accountId: string,
  creatorUserId: string,
  input: CreateLessonInput,
): Promise<Lesson> {
  return createLesson({ accountId, creatorUserId, ...input });
}

export async function listLessons(
  accountId: string,
  page: number,
  limit: number,
): Promise<Paginated<Lesson>> {
  return listLessonsByAccount(accountId, page, limit);
}

export async function getLesson(lessonId: string, accountId: string): Promise<Lesson> {
  return findLessonByIdScoped(lessonId, accountId);
}

export async function updateLesson(
  lessonId: string,
  accountId: string,
  input: UpdateLessonInput,
): Promise<Lesson> {
  return updateLessonScoped(lessonId, accountId, input);
}

export async function deleteLesson(
  lessonId: string,
  accountId: string,
  actorUserId: string,
): Promise<void> {
  await findLessonByIdScoped(lessonId, accountId);
  await deleteLessonScoped(lessonId, accountId);
  await createAuditLog({
    accountId,
    actorUserId,
    action: 'lesson.delete',
    entityType: 'Lesson',
    entityId: lessonId,
  });
}
