import { v4 as uuidv4 } from 'uuid';
import LessonModel, { type LessonDoc } from '@/models/Lesson';
import { NotFoundError } from '@/lib/errors';
import type { Lesson, Paginated } from '@/types';

function toLesson(doc: LessonDoc): Lesson {
  return {
    id: doc._id,
    accountId: doc.accountId,
    creatorUserId: doc.creatorUserId,
    schemeId: doc.schemeId ?? null,
    schemeWeekId: doc.schemeWeekId ?? null,
    date: doc.date.toISOString(),
    klass: doc.klass,
    subject: doc.subject,
    theme: doc.theme ?? '',
    topic: doc.topic,
    duration: doc.duration,
    numLearners: doc.numLearners,
    competency: doc.competency ?? '',
    introduction: doc.introduction ?? '',
    teacherActivities: doc.teacherActivities ?? '',
    learnerActivities: doc.learnerActivities ?? '',
    materials: doc.materials ?? '',
    assessment: doc.assessment ?? '',
    conclusion: doc.conclusion ?? '',
    reflection: doc.reflection ?? '',
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

type CreateLessonInput = Omit<
  Lesson,
  'id' | 'createdAt' | 'updatedAt' | 'date' | 'schemeId' | 'schemeWeekId'
> & {
  date: string | Date;
  schemeId?: string | null;
  schemeWeekId?: string | null;
};

export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
  const doc = await LessonModel.create({
    _id: uuidv4(),
    ...input,
    schemeId: input.schemeId ?? null,
    schemeWeekId: input.schemeWeekId ?? null,
    date: new Date(input.date),
  });
  return toLesson(doc);
}

export async function findLessonByIdScoped(lessonId: string, accountId: string): Promise<Lesson> {
  const doc = await LessonModel.findOne({ _id: lessonId, accountId }).lean();
  if (!doc) throw new NotFoundError('Lesson not found');
  return toLesson(doc);
}

export async function listLessonsByAccount(
  accountId: string,
  page: number,
  limit: number,
): Promise<Paginated<Lesson>> {
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    LessonModel.find({ accountId }).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    LessonModel.countDocuments({ accountId }),
  ]);
  return {
    items: docs.map(toLesson),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function updateLessonScoped(
  lessonId: string,
  accountId: string,
  updates: Partial<Omit<CreateLessonInput, 'accountId' | 'creatorUserId'>>,
): Promise<Lesson> {
  const existing = await LessonModel.findOne({ _id: lessonId, accountId }).lean();
  if (!existing) throw new NotFoundError('Lesson not found');
  const payload: Record<string, unknown> = { ...updates };
  if (updates.date) payload.date = new Date(updates.date);
  const doc = await LessonModel.findByIdAndUpdate(lessonId, payload, { returnDocument: 'after' }).lean();
  if (!doc) throw new NotFoundError('Lesson not found');
  return toLesson(doc);
}

export async function deleteLessonScoped(lessonId: string, accountId: string): Promise<void> {
  const result = await LessonModel.deleteOne({ _id: lessonId, accountId });
  if (result.deletedCount === 0) throw new NotFoundError('Lesson not found');
}
