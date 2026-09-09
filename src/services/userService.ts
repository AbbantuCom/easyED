import { ForbiddenError } from '@/lib/errors';
import {
  deleteUserScoped,
  findUserByIdScoped,
  listUsersByAccount,
  updateUserDisplayName,
  updateUserRole,
} from '@/repositories/userRepository';
import { findRoleByIdScoped } from '@/repositories/roleRepository';
import { createAuditLog } from '@/repositories/auditLogRepository';
import type { User } from '@/types';

export async function listStaff(accountId: string): Promise<User[]> {
  return listUsersByAccount(accountId);
}

export async function updateOwnDisplayName(userId: string, displayName: string): Promise<User> {
  return updateUserDisplayName(userId, displayName);
}

export async function changeStaffRole(
  targetUserId: string,
  accountId: string,
  roleId: string,
  actorUserId: string,
): Promise<User> {
  await findRoleByIdScoped(roleId, accountId);
  const user = await updateUserRole(targetUserId, accountId, roleId);
  await createAuditLog({
    accountId,
    actorUserId,
    action: 'role.assign',
    entityType: 'User',
    entityId: targetUserId,
    metadata: { roleId },
  });
  return user;
}

export async function removeStaff(
  targetUserId: string,
  accountId: string,
  actorUserId: string,
): Promise<void> {
  if (targetUserId === actorUserId) {
    throw new ForbiddenError('You cannot remove your own account');
  }
  const target = await findUserByIdScoped(targetUserId, accountId);
  await deleteUserScoped(targetUserId, accountId);
  await createAuditLog({
    accountId,
    actorUserId,
    action: 'staff.remove',
    entityType: 'User',
    entityId: targetUserId,
    metadata: { email: target.email },
  });
}
