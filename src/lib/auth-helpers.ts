import { connectDB } from '@/lib/db';
import { readSessionCookie } from '@/lib/cookies';
import { verifySessionToken } from '@/lib/jwt';
import { UnauthorizedError } from '@/lib/errors';
import { resolvePermissions } from '@/lib/permissions';
import { findAccountById } from '@/repositories/accountRepository';
import { findUserById } from '@/repositories/userRepository';
import { findRoleById } from '@/repositories/roleRepository';
import type { AuthContext } from '@/types';

export async function getAuthenticatedUser(request: Request): Promise<AuthContext> {
  await connectDB();

  const token = readSessionCookie(request);
  if (!token) throw new UnauthorizedError('Not authenticated');

  let payload;
  try {
    payload = verifySessionToken(token);
  } catch {
    throw new UnauthorizedError('Invalid or expired session');
  }

  const user = await findUserById(payload.userId);
  if (!user || user.accountId !== payload.accountId) {
    throw new UnauthorizedError('Invalid session');
  }

  const account = await findAccountById(user.accountId);
  const role = user.roleId ? await findRoleById(user.roleId) : null;
  const permissions = resolvePermissions(account, role);

  return { user, account, role, permissions };
}
