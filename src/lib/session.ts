import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { verifySessionToken } from '@/lib/jwt';
import { resolvePermissions } from '@/lib/permissions';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { findAccountById } from '@/repositories/accountRepository';
import { findUserById } from '@/repositories/userRepository';
import { findRoleById } from '@/repositories/roleRepository';
import type { AuthContext } from '@/types';

/** For use in Server Components (e.g. the authenticated layout), which read cookies via next/headers rather than a Request object. */
export async function getServerSession(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  let payload;
  try {
    payload = verifySessionToken(token);
  } catch {
    return null;
  }

  await connectDB();

  const user = await findUserById(payload.userId);
  if (!user || user.accountId !== payload.accountId) return null;

  const account = await findAccountById(user.accountId);
  const role = user.roleId ? await findRoleById(user.roleId) : null;
  const permissions = resolvePermissions(account, role);

  return { user, account, role, permissions };
}
