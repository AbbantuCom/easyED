import { v4 as uuidv4 } from 'uuid';
import AccountModel, { type AccountDoc } from '@/models/Account';
import { NotFoundError } from '@/lib/errors';
import type { Account } from '@/types';
import type { AccountType } from '@/lib/constants';

function toAccount(doc: AccountDoc): Account {
  return {
    id: doc._id,
    type: doc.type,
    name: doc.name,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function createAccount(type: AccountType, name: string): Promise<Account> {
  const doc = await AccountModel.create({ _id: uuidv4(), type, name });
  return toAccount(doc);
}

export async function findAccountById(accountId: string): Promise<Account> {
  const doc = await AccountModel.findById(accountId).lean();
  if (!doc) throw new NotFoundError('Account not found');
  return toAccount(doc);
}

export async function updateAccountName(accountId: string, name: string): Promise<Account> {
  const doc = await AccountModel.findByIdAndUpdate(accountId, { name }, { returnDocument: 'after' }).lean();
  if (!doc) throw new NotFoundError('Account not found');
  return toAccount(doc);
}
