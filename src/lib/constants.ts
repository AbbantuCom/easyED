export const ACCOUNT_TYPES = ['individual', 'school'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const USER_STATUSES = ['invited', 'active'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const PERMISSIONS = [
  'scheme.create',
  'scheme.edit',
  'scheme.delete',
  'scheme.view',
  'lesson.create',
  'lesson.edit',
  'lesson.delete',
  'lesson.view',
  'staff.invite',
  'staff.remove',
  'role.manage',
  'account.manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ACADEMIC_HEAD_PERMISSIONS: Permission[] = [
  'scheme.create',
  'scheme.edit',
  'scheme.delete',
  'scheme.view',
  'lesson.view',
];

export const TEACHER_PERMISSIONS: Permission[] = [
  'lesson.create',
  'lesson.edit',
  'lesson.delete',
  'lesson.view',
  'scheme.view',
];

export const AUDIT_ACTIONS = [
  'role.assign',
  'staff.remove',
  'scheme.delete',
  'lesson.delete',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const SESSION_COOKIE_NAME = 'easyed_session';
