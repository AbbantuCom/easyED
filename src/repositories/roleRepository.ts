import { v4 as uuidv4 } from 'uuid';
import RoleModel, { type RoleDoc } from '@/models/Role';
import { NotFoundError } from '@/lib/errors';
import type { Role } from '@/types';
import type { Permission } from '@/lib/constants';

function toRole(doc: RoleDoc): Role {
  return {
    id: doc._id,
    accountId: doc.accountId,
    name: doc.name,
    isSuperAdmin: doc.isSuperAdmin,
    permissions: doc.permissions as Permission[],
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

interface CreateRoleInput {
  accountId: string;
  name: string;
  isSuperAdmin?: boolean;
  permissions: Permission[];
}

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const doc = await RoleModel.create({
    _id: uuidv4(),
    accountId: input.accountId,
    name: input.name,
    isSuperAdmin: input.isSuperAdmin ?? false,
    permissions: input.permissions,
  });
  return toRole(doc);
}

export async function findRoleById(roleId: string): Promise<Role | null> {
  const doc = await RoleModel.findById(roleId).lean();
  return doc ? toRole(doc) : null;
}

export async function findRoleByIdScoped(roleId: string, accountId: string): Promise<Role> {
  const doc = await RoleModel.findOne({ _id: roleId, accountId }).lean();
  if (!doc) throw new NotFoundError('Role not found');
  return toRole(doc);
}

export async function listRolesByAccount(accountId: string): Promise<Role[]> {
  const docs = await RoleModel.find({ accountId }).sort({ createdAt: 1 }).lean();
  return docs.map(toRole);
}

export async function updateRoleScoped(
  roleId: string,
  accountId: string,
  updates: { name?: string; permissions?: Permission[] },
): Promise<Role> {
  const existing = await RoleModel.findOne({ _id: roleId, accountId }).lean();
  if (!existing) throw new NotFoundError('Role not found');
  const doc = await RoleModel.findByIdAndUpdate(roleId, updates, { returnDocument: 'after' }).lean();
  if (!doc) throw new NotFoundError('Role not found');
  return toRole(doc);
}

export async function deleteRoleScoped(roleId: string, accountId: string): Promise<void> {
  const result = await RoleModel.deleteOne({ _id: roleId, accountId });
  if (result.deletedCount === 0) throw new NotFoundError('Role not found');
}
