import { ForbiddenError } from '@/lib/errors';
import {
  createRole,
  deleteRoleScoped,
  findRoleByIdScoped,
  listRolesByAccount,
  updateRoleScoped,
} from '@/repositories/roleRepository';
import type { CreateRoleInput, UpdateRoleInput } from '@/validators/roleValidators';
import type { Role } from '@/types';

export async function listRoles(accountId: string): Promise<Role[]> {
  return listRolesByAccount(accountId);
}

export async function createAccountRole(
  accountId: string,
  input: CreateRoleInput,
): Promise<Role> {
  return createRole({ accountId, name: input.name, permissions: input.permissions });
}

export async function updateAccountRole(
  roleId: string,
  accountId: string,
  input: UpdateRoleInput,
): Promise<Role> {
  const existing = await findRoleByIdScoped(roleId, accountId);
  if (existing.isSuperAdmin) {
    throw new ForbiddenError('The Super Admin role cannot be edited');
  }
  return updateRoleScoped(roleId, accountId, input);
}

export async function deleteAccountRole(roleId: string, accountId: string): Promise<void> {
  const existing = await findRoleByIdScoped(roleId, accountId);
  if (existing.isSuperAdmin) {
    throw new ForbiddenError('The Super Admin role cannot be deleted');
  }
  await deleteRoleScoped(roleId, accountId);
}
