import { PERMISSIONS, type Permission } from '@/lib/constants';
import { ForbiddenError } from '@/lib/errors';
import type { Account, AuthContext, Role, User } from '@/types';

export function resolvePermissions(account: Account, role: Role | null): Permission[] {
  if (account.type === 'individual') {
    return [...PERMISSIONS];
  }
  if (!role) return [];
  if (role.isSuperAdmin) return [...PERMISSIONS];
  return role.permissions;
}

export function checkPermission(
  user: User,
  account: Account,
  permissions: Permission[],
  requiredPermission: Permission,
): boolean {
  if (account.type === 'individual') return true;
  return permissions.includes(requiredPermission);
}

export function requirePermission(ctx: AuthContext, requiredPermission: Permission): void {
  const allowed = checkPermission(ctx.user, ctx.account, ctx.permissions, requiredPermission);
  if (!allowed) {
    throw new ForbiddenError(`Missing required permission: ${requiredPermission}`);
  }
}
