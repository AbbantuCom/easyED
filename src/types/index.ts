import type { AccountType, Permission, UserStatus } from '@/lib/constants';

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  accountId: string;
  email: string;
  displayName: string;
  roleId: string | null;
  status: UserStatus;
  invitedAt: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  accountId: string;
  name: string;
  isSuperAdmin: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Scheme {
  id: string;
  accountId: string;
  creatorUserId: string;
  klass: string;
  subject: string;
  term: string;
  year: number;
  weekCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchemeWeek {
  id: string;
  schemeId: string;
  week: number;
  theme: string;
  topic: string;
  competency: string;
  teacherActivities: string;
  learnerActivities: string;
  materials: string;
  assessment: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  accountId: string;
  creatorUserId: string;
  schemeId: string | null;
  schemeWeekId: string | null;
  date: string;
  klass: string;
  subject: string;
  theme: string;
  topic: string;
  duration: string;
  numLearners: number;
  competency: string;
  introduction: string;
  teacherActivities: string;
  learnerActivities: string;
  materials: string;
  assessment: string;
  conclusion: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  accountId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface InviteToken {
  id: string;
  token: string;
  userId: string;
  accountId: string;
  otpHash: string | null;
  otpExpiresAt: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface PasswordResetToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface AuthContext {
  user: User;
  account: Account;
  role: Role | null;
  permissions: Permission[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type FieldErrors = Record<string, string>;
