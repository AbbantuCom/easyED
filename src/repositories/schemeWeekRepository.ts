import { v4 as uuidv4 } from 'uuid';
import SchemeWeekModel, { type SchemeWeekDoc } from '@/models/SchemeWeek';
import { NotFoundError } from '@/lib/errors';
import type { SchemeWeek } from '@/types';

function toWeek(doc: SchemeWeekDoc): SchemeWeek {
  return {
    id: doc._id,
    schemeId: doc.schemeId,
    week: doc.week,
    theme: doc.theme ?? '',
    topic: doc.topic ?? '',
    competency: doc.competency ?? '',
    teacherActivities: doc.teacherActivities ?? '',
    learnerActivities: doc.learnerActivities ?? '',
    materials: doc.materials ?? '',
    assessment: doc.assessment ?? '',
    remarks: doc.remarks ?? '',
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

interface CreateWeekInput {
  schemeId: string;
  week: number;
  theme: string;
  topic: string;
  competency: string;
  teacherActivities: string;
  learnerActivities: string;
  materials: string;
  assessment: string;
  remarks: string;
}

/** Caller must first verify the parent scheme belongs to the account (schemes have accountId; weeks do not). */
export async function createWeek(input: CreateWeekInput): Promise<SchemeWeek> {
  const doc = await SchemeWeekModel.create({ _id: uuidv4(), ...input });
  return toWeek(doc);
}

export async function listWeeksByScheme(schemeId: string): Promise<SchemeWeek[]> {
  const docs = await SchemeWeekModel.find({ schemeId }).sort({ week: 1 }).lean();
  return docs.map(toWeek);
}

export async function findWeekByIdInScheme(
  weekId: string,
  schemeId: string,
): Promise<SchemeWeek> {
  const doc = await SchemeWeekModel.findOne({ _id: weekId, schemeId }).lean();
  if (!doc) throw new NotFoundError('Scheme week not found');
  return toWeek(doc);
}

export async function updateWeekInScheme(
  weekId: string,
  schemeId: string,
  updates: Partial<Omit<CreateWeekInput, 'schemeId'>>,
): Promise<SchemeWeek> {
  const existing = await SchemeWeekModel.findOne({ _id: weekId, schemeId }).lean();
  if (!existing) throw new NotFoundError('Scheme week not found');
  const doc = await SchemeWeekModel.findByIdAndUpdate(weekId, updates, { returnDocument: 'after' }).lean();
  if (!doc) throw new NotFoundError('Scheme week not found');
  return toWeek(doc);
}

export async function deleteWeekInScheme(weekId: string, schemeId: string): Promise<void> {
  const result = await SchemeWeekModel.deleteOne({ _id: weekId, schemeId });
  if (result.deletedCount === 0) throw new NotFoundError('Scheme week not found');
}
