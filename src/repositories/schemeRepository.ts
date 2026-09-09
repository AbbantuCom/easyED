import { v4 as uuidv4 } from 'uuid';
import SchemeModel, { type SchemeDoc } from '@/models/Scheme';
import SchemeWeekModel from '@/models/SchemeWeek';
import { NotFoundError } from '@/lib/errors';
import type { Paginated, Scheme } from '@/types';

function toScheme(doc: SchemeDoc, weekCount?: number): Scheme {
  return {
    id: doc._id,
    accountId: doc.accountId,
    creatorUserId: doc.creatorUserId,
    klass: doc.klass,
    subject: doc.subject,
    term: doc.term,
    year: doc.year,
    weekCount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

interface CreateSchemeInput {
  accountId: string;
  creatorUserId: string;
  klass: string;
  subject: string;
  term: string;
  year: number;
}

export async function createScheme(input: CreateSchemeInput): Promise<Scheme> {
  const doc = await SchemeModel.create({ _id: uuidv4(), ...input });
  return toScheme(doc, 0);
}

export async function findSchemeByIdScoped(schemeId: string, accountId: string): Promise<Scheme> {
  const doc = await SchemeModel.findOne({ _id: schemeId, accountId }).lean();
  if (!doc) throw new NotFoundError('Scheme not found');
  const weekCount = await SchemeWeekModel.countDocuments({ schemeId });
  return toScheme(doc, weekCount);
}

export async function listSchemesByAccount(
  accountId: string,
  page: number,
  limit: number,
): Promise<Paginated<Scheme>> {
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    SchemeModel.find({ accountId }).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    SchemeModel.countDocuments({ accountId }),
  ]);

  const schemeIds = docs.map((d: SchemeDoc) => d._id);
  const weekCounts: { _id: string; count: number }[] = await SchemeWeekModel.aggregate([
    { $match: { schemeId: { $in: schemeIds } } },
    { $group: { _id: '$schemeId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(weekCounts.map((w) => [w._id, w.count]));

  return {
    items: docs.map((doc: SchemeDoc) => toScheme(doc, countMap.get(doc._id) ?? 0)),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function updateSchemeScoped(
  schemeId: string,
  accountId: string,
  updates: Partial<{ klass: string; subject: string; term: string; year: number }>,
): Promise<Scheme> {
  const existing = await SchemeModel.findOne({ _id: schemeId, accountId }).lean();
  if (!existing) throw new NotFoundError('Scheme not found');
  const doc = await SchemeModel.findByIdAndUpdate(schemeId, updates, { returnDocument: 'after' }).lean();
  if (!doc) throw new NotFoundError('Scheme not found');
  const weekCount = await SchemeWeekModel.countDocuments({ schemeId });
  return toScheme(doc, weekCount);
}

export async function deleteSchemeScoped(schemeId: string, accountId: string): Promise<void> {
  const result = await SchemeModel.deleteOne({ _id: schemeId, accountId });
  if (result.deletedCount === 0) throw new NotFoundError('Scheme not found');
  await SchemeWeekModel.deleteMany({ schemeId });
}
