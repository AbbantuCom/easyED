import { v4 as uuidv4 } from 'uuid';
import AuditLogModel, { type AuditLogDoc } from '@/models/AuditLog';
import type { AuditLog } from '@/types';
import type { AuditAction } from '@/lib/constants';

function toAuditLog(doc: AuditLogDoc): AuditLog {
  return {
    id: doc._id,
    accountId: doc.accountId,
    actorUserId: doc.actorUserId,
    action: doc.action,
    entityType: doc.entityType,
    entityId: doc.entityId,
    metadata: doc.metadata ?? {},
    createdAt: doc.createdAt.toISOString(),
  };
}

interface CreateAuditLogInput {
  accountId: string;
  actorUserId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(input: CreateAuditLogInput): Promise<AuditLog> {
  const doc = await AuditLogModel.create({
    _id: uuidv4(),
    ...input,
    metadata: input.metadata ?? {},
  });
  return toAuditLog(doc);
}

export async function listAuditLogsByAccount(accountId: string): Promise<AuditLog[]> {
  const docs = await AuditLogModel.find({ accountId }).sort({ createdAt: -1 }).lean();
  return docs.map(toAuditLog);
}
