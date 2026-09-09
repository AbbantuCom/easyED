import { v4 as uuidv4 } from 'uuid';
import InviteTokenModel, { type InviteTokenDoc } from '@/models/InviteToken';
import { NotFoundError } from '@/lib/errors';
import type { InviteToken } from '@/types';

function toInviteToken(doc: InviteTokenDoc): InviteToken {
  return {
    id: doc._id,
    token: doc.token,
    userId: doc.userId,
    accountId: doc.accountId,
    otpHash: doc.otpHash ?? null,
    otpExpiresAt: doc.otpExpiresAt ? doc.otpExpiresAt.toISOString() : null,
    expiresAt: doc.expiresAt.toISOString(),
    usedAt: doc.usedAt ? doc.usedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
  };
}

interface CreateInviteTokenInput {
  token: string;
  userId: string;
  accountId: string;
  expiresAt: Date;
}

export async function createInviteToken(input: CreateInviteTokenInput): Promise<InviteToken> {
  const doc = await InviteTokenModel.create({ _id: uuidv4(), ...input });
  return toInviteToken(doc);
}

export async function findInviteTokenByToken(token: string): Promise<InviteToken> {
  const doc = await InviteTokenModel.findOne({ token }).lean();
  if (!doc) throw new NotFoundError('Invite not found');
  return toInviteToken(doc);
}

export async function setInviteOtp(
  token: string,
  otpHash: string,
  otpExpiresAt: Date,
): Promise<InviteToken> {
  const doc = await InviteTokenModel.findOneAndUpdate(
    { token },
    { otpHash, otpExpiresAt },
    { returnDocument: 'after' },
  ).lean();
  if (!doc) throw new NotFoundError('Invite not found');
  return toInviteToken(doc);
}

export async function markInviteTokenUsed(token: string): Promise<void> {
  const result = await InviteTokenModel.updateOne({ token }, { usedAt: new Date() });
  if (result.matchedCount === 0) throw new NotFoundError('Invite not found');
}
