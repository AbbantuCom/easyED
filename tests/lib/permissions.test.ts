import { describe, expect, it } from 'vitest';
import { checkPermission, resolvePermissions } from '@/lib/permissions';
import type { Account, Role, User } from '@/types';

const baseUser: User = {
  id: 'user-1',
  accountId: 'account-1',
  email: 'user@example.com',
  displayName: 'Test User',
  roleId: null,
  status: 'active',
  invitedAt: null,
  activatedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const individualAccount: Account = {
  id: 'account-1',
  type: 'individual',
  name: 'Individual Account',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const schoolAccount: Account = {
  ...individualAccount,
  type: 'school',
  name: 'School Account',
};

function makeRole(overrides: Partial<Role>): Role {
  return {
    id: 'role-1',
    accountId: 'account-1',
    name: 'Teacher',
    isSuperAdmin: false,
    permissions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('checkPermission', () => {
  it('always allows individual accounts regardless of permissions array', () => {
    const result = checkPermission(baseUser, individualAccount, [], 'account.manage');
    expect(result).toBe(true);
  });

  it('allows school accounts when the permission is present in the resolved list', () => {
    const result = checkPermission(baseUser, schoolAccount, ['scheme.create'], 'scheme.create');
    expect(result).toBe(true);
  });

  it('denies school accounts when the permission is absent from the resolved list', () => {
    const result = checkPermission(baseUser, schoolAccount, ['scheme.view'], 'scheme.delete');
    expect(result).toBe(false);
  });

  it('denies school accounts with no permissions at all', () => {
    const result = checkPermission(baseUser, schoolAccount, [], 'lesson.view');
    expect(result).toBe(false);
  });
});

describe('resolvePermissions', () => {
  it('grants every permission to individual accounts', () => {
    const permissions = resolvePermissions(individualAccount, null);
    expect(permissions).toContain('account.manage');
    expect(permissions).toContain('staff.invite');
  });

  it('grants every permission to a super admin role on a school account', () => {
    const superAdmin = makeRole({ isSuperAdmin: true, permissions: [] });
    const permissions = resolvePermissions(schoolAccount, superAdmin);
    expect(permissions).toContain('role.manage');
    expect(permissions).toContain('account.manage');
  });

  it("limits a school account's permissions to the role's own permission list", () => {
    const teacher = makeRole({ permissions: ['lesson.create', 'lesson.view'] });
    const permissions = resolvePermissions(schoolAccount, teacher);
    expect(permissions).toEqual(['lesson.create', 'lesson.view']);
  });

  it('grants no permissions for a school account with no role', () => {
    const permissions = resolvePermissions(schoolAccount, null);
    expect(permissions).toEqual([]);
  });
});
