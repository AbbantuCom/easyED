import { v4 as uuidv4 } from 'uuid';
import UserModel, { type UserDoc } from '@/models/User';
import { NotFoundError } from '@/lib/errors';
import type { User } from '@/types';
import type { UserStatus } from '@/lib/constants';

const PUBLIC_PROJECTION = '-passwordHash';

function toUser(doc: UserDoc): User {
  return {
    id: doc._id,
    accountId: doc.accountId,
    email: doc.email,
    displayName: doc.displayName,
    roleId: doc.roleId ?? null,
    status: doc.status,
    invitedAt: doc.invitedAt ? doc.invitedAt.toISOString() : null,
    activatedAt: doc.activatedAt ? doc.activatedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

interface CreateUserInput {
  accountId: string;
  email: string;
  displayName: string;
  passwordHash: string;
  roleId?: string | null;
  status: UserStatus;
  invitedAt?: Date | null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const doc = await UserModel.create({
    _id: uuidv4(),
    accountId: input.accountId,
    email: input.email.toLowerCase(),
    displayName: input.displayName,
    passwordHash: input.passwordHash,
    roleId: input.roleId ?? null,
    status: input.status,
    invitedAt: input.invitedAt ?? null,
    activatedAt: input.status === 'active' ? new Date() : null,
  });
  return toUser(doc);
}

/** Returns the raw document (including passwordHash) for credential verification during login. */
export async function findUserByEmailForAuth(email: string): Promise<UserDoc | null> {
  return UserModel.findOne({ email: email.toLowerCase() }).lean();
}

/** Returns the raw document (including passwordHash) for verifying the current password on change. */
export async function findUserByIdForAuth(userId: string): Promise<UserDoc | null> {
  return UserModel.findById(userId).lean();
}

export async function findUserById(userId: string): Promise<User | null> {
  const doc = await UserModel.findById(userId, PUBLIC_PROJECTION).lean();
  return doc ? toUser(doc) : null;
}

export async function findUserByIdScoped(userId: string, accountId: string): Promise<User> {
  const doc = await UserModel.findOne({ _id: userId, accountId }, PUBLIC_PROJECTION).lean();
  if (!doc) throw new NotFoundError('User not found');
  return toUser(doc);
}

export async function emailExists(email: string): Promise<boolean> {
  const count = await UserModel.countDocuments({ email: email.toLowerCase() });
  return count > 0;
}

export async function listUsersByAccount(accountId: string): Promise<User[]> {
  const docs = await UserModel.find({ accountId }, PUBLIC_PROJECTION)
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toUser);
}

export async function updateUserRole(
  userId: string,
  accountId: string,
  roleId: string,
): Promise<User> {
  const doc = await UserModel.findOneAndUpdate(
    { _id: userId, accountId },
    { roleId },
    { returnDocument: 'after', projection: PUBLIC_PROJECTION },
  ).lean();
  if (!doc) throw new NotFoundError('User not found');
  return toUser(doc);
}

export async function deleteUserScoped(userId: string, accountId: string): Promise<void> {
  const result = await UserModel.deleteOne({ _id: userId, accountId });
  if (result.deletedCount === 0) throw new NotFoundError('User not found');
}

export async function activateInvitedUser(
  userId: string,
  displayName: string,
  passwordHash: string,
): Promise<User> {
  const doc = await UserModel.findByIdAndUpdate(
    userId,
    {
      displayName,
      passwordHash,
      status: 'active',
      activatedAt: new Date(),
    },
    { returnDocument: 'after', projection: PUBLIC_PROJECTION },
  ).lean();
  if (!doc) throw new NotFoundError('User not found');
  return toUser(doc);
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const result = await UserModel.updateOne({ _id: userId }, { passwordHash });
  if (result.matchedCount === 0) throw new NotFoundError('User not found');
}

export async function updateUserDisplayName(userId: string, displayName: string): Promise<User> {
  const doc = await UserModel.findByIdAndUpdate(
    userId,
    { displayName },
    { returnDocument: 'after', projection: PUBLIC_PROJECTION },
  ).lean();
  if (!doc) throw new NotFoundError('User not found');
  return toUser(doc);
}
