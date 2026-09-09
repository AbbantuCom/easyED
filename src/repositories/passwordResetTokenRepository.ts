import { v4 as uuidv4 } from 'uuid';
import PasswordResetTokenModel, {
  type PasswordResetTokenDoc,
} from '@/models/PasswordResetToken';
import { NotFoundError } from '@/lib/errors';
import type { PasswordResetToken } from '@/types';

function toResetToken(doc: PasswordResetTokenDoc): PasswordResetToken {
  return {
    id: doc._id,
    token: doc.token,
    userId: doc.userId,
    expiresAt: doc.expiresAt.toISOString(),
    usedAt: doc.usedAt ? doc.usedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function createPasswordResetToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<PasswordResetToken> {
  const doc = await PasswordResetTokenModel.create({ _id: uuidv4(), userId, token, expiresAt });
  return toResetToken(doc);
}

export async function findPasswordResetTokenByToken(
  token: string,
): Promise<PasswordResetToken | null> {
  const doc = await PasswordResetTokenModel.findOne({ token }).lean();
  return doc ? toResetToken(doc) : null;
}

export async function markPasswordResetTokenUsed(token: string): Promise<void> {
  const result = await PasswordResetTokenModel.updateOne({ token }, { usedAt: new Date() });
  if (result.matchedCount === 0) throw new NotFoundError('Reset token not found');
}
