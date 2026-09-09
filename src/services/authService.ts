import { hashPassword, verifyPassword } from '@/lib/password';
import { signSessionToken } from '@/lib/jwt';
import { generateToken } from '@/lib/otp';
import { UnauthorizedError, ForbiddenError, ConflictError, NotFoundError } from '@/lib/errors';
import { resolvePermissions } from '@/lib/permissions';
import { ACADEMIC_HEAD_PERMISSIONS, PERMISSIONS, TEACHER_PERMISSIONS } from '@/lib/constants';
import { createAccount, findAccountById } from '@/repositories/accountRepository';
import {
  createUser,
  emailExists,
  findUserByEmailForAuth,
  findUserByIdForAuth,
  updateUserPassword,
} from '@/repositories/userRepository';
import { createRole, findRoleById } from '@/repositories/roleRepository';
import {
  createPasswordResetToken,
  findPasswordResetTokenByToken,
  markPasswordResetTokenUsed,
} from '@/repositories/passwordResetTokenRepository';
import { sendPasswordResetEmail } from '@/lib/email';
import type { RegisterInput } from '@/validators/authValidators';
import type { Account, AuthContext, Role, User } from '@/types';

interface AuthResult {
  user: User;
  account: Account;
  role: Role | null;
  permissions: AuthContext['permissions'];
  token: string;
}

export async function registerAccount(input: RegisterInput): Promise<AuthResult> {
  if (await emailExists(input.email)) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  if (input.type === 'individual') {
    const account = await createAccount('individual', input.name);
    const user = await createUser({
      accountId: account.id,
      email: input.email,
      displayName: input.name,
      passwordHash,
      roleId: null,
      status: 'active',
    });
    const permissions = resolvePermissions(account, null);
    const token = signSessionToken({ userId: user.id, accountId: account.id });
    return { user, account, role: null, permissions, token };
  }

  const account = await createAccount('school', input.schoolName);

  const superAdminRole = await createRole({
    accountId: account.id,
    name: 'Super Admin',
    isSuperAdmin: true,
    permissions: [...PERMISSIONS],
  });
  await createRole({
    accountId: account.id,
    name: 'Academic Head',
    permissions: ACADEMIC_HEAD_PERMISSIONS,
  });
  await createRole({
    accountId: account.id,
    name: 'Teacher',
    permissions: TEACHER_PERMISSIONS,
  });

  const user = await createUser({
    accountId: account.id,
    email: input.email,
    displayName: input.displayName,
    passwordHash,
    roleId: superAdminRole.id,
    status: 'active',
  });

  const permissions = resolvePermissions(account, superAdminRole);
  const token = signSessionToken({ userId: user.id, accountId: account.id });
  return { user, account, role: superAdminRole, permissions, token };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const doc = await findUserByEmailForAuth(email);
  if (!doc) throw new UnauthorizedError('Invalid email or password');

  const passwordMatches = await verifyPassword(password, doc.passwordHash);
  if (!passwordMatches) throw new UnauthorizedError('Invalid email or password');

  if (doc.status === 'invited') {
    throw new ForbiddenError('Please complete your account setup via the invite link.');
  }

  const account = await findAccountById(doc.accountId);
  const role = doc.roleId ? await findRoleById(doc.roleId) : null;
  const permissions = resolvePermissions(account, role);
  const token = signSessionToken({ userId: doc._id, accountId: doc.accountId });

  const user: User = {
    id: doc._id,
    accountId: doc.accountId,
    email: doc.email,
    displayName: doc.displayName,
    roleId: doc.roleId ?? null,
    status: doc.status,
    invitedAt: doc.invitedAt ? new Date(doc.invitedAt).toISOString() : null,
    activatedAt: doc.activatedAt ? new Date(doc.activatedAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };

  return { user, account, role, permissions, token };
}

export async function requestPasswordReset(email: string): Promise<void> {
  const doc = await findUserByEmailForAuth(email);
  if (!doc) return; // Do not reveal whether the email exists.

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await createPasswordResetToken(doc._id, token, expiresAt);
  await sendPasswordResetEmail(doc.email, token);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const resetToken = await findPasswordResetTokenByToken(token);
  if (!resetToken) throw new NotFoundError('Invalid or expired reset token');
  if (resetToken.usedAt) throw new NotFoundError('Invalid or expired reset token');
  if (new Date(resetToken.expiresAt).getTime() < Date.now()) {
    throw new NotFoundError('Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(newPassword);
  await updateUserPassword(resetToken.userId, passwordHash);
  await markPasswordResetTokenUsed(token);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const doc = await findUserByIdForAuth(userId);
  if (!doc) throw new NotFoundError('User not found');

  const matches = await verifyPassword(currentPassword, doc.passwordHash);
  if (!matches) throw new UnauthorizedError('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await updateUserPassword(userId, passwordHash);
}
