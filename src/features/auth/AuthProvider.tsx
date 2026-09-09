'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Account, User } from '@/types';
import type { Permission } from '@/lib/constants';

export interface AuthSession {
  user: User;
  account: Account;
  permissions: Permission[];
}

const AuthContext = createContext<AuthSession | null>(null);

export function AuthProvider({
  session,
  children,
}: {
  session: AuthSession;
  children: ReactNode;
}) {
  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthSession {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function useHasPermission(permission: Permission): boolean {
  const { account, permissions } = useAuth();
  if (account.type === 'individual') return true;
  return permissions.includes(permission);
}
