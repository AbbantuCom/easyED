import { hashPassword } from '@/lib/password';
import { signSessionToken } from '@/lib/jwt';
import { generateOtp, generateToken, hashOtp, verifyOtp } from '@/lib/otp';
import { sendInviteEmail, sendOtpEmail } from '@/lib/email';
import { ConflictError, NotFoundError, UnauthorizedError } from '@/lib/errors';
import { resolvePermissions } from '@/lib/permissions';
import {
  createUser,
  activateInvitedUser,
  emailExists,
  findUserById,
} from '@/repositories/userRepository';
import { findRoleByIdScoped } from '@/repositories/roleRepository';
import { findAccountById } from '@/repositories/accountRepository';
import {
  createInviteToken,
  findInviteTokenByToken,
  markInviteTokenUsed,
  setInviteOtp,
} from '@/repositories/inviteTokenRepository';
import type { AcceptInviteInput } from '@/validators/inviteValidators';
import type { Account, AuthContext, Role, User } from '@/types';

const INVITE_EXPIRY_HOURS = Number(process.env.INVITE_TOKEN_EXPIRY_HOURS ?? '72');
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? '15');

export async function sendStaffInvite(
  accountId: string,
  email: string,
  roleId: string,
): Promise<void> {
  await findRoleByIdScoped(roleId, accountId);

  if (await emailExists(email)) {
    throw new ConflictError('An account with this email already exists');
  }

  const invitedAt = new Date();
  const user = await createUser({
    accountId,
    email,
    displayName: email,
    passwordHash: await hashPassword(generateToken()),
    roleId,
    status: 'invited',
    invitedAt,
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);
  await createInviteToken({ token, userId: user.id, accountId, expiresAt });
  await sendInviteEmail(email, token);
}

export async function requestInviteOtp(token: string): Promise<void> {
  const invite = await findInviteTokenByToken(token);
  if (invite.usedAt) throw new NotFoundError('Invite link is no longer valid');
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    throw new NotFoundError('Invite link has expired');
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await setInviteOtp(token, otpHash, otpExpiresAt);

  const invitee = await findUserById(invite.userId);
  if (!invitee) throw new NotFoundError('Invite not found');
  await sendOtpEmail(invitee.email, otp);
}

export async function getInviteeEmailByToken(token: string): Promise<string> {
  const invite = await findInviteTokenByToken(token);
  if (invite.usedAt) throw new NotFoundError('Invite link is no longer valid');
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    throw new NotFoundError('Invite link has expired');
  }
  const invitee = await findUserById(invite.userId);
  if (!invitee) throw new NotFoundError('Invite not found');
  return invitee.email;
}

interface AcceptInviteResult {
  user: User;
  account: Account;
  role: Role | null;
  permissions: AuthContext['permissions'];
  token: string;
}

export async function acceptInvite(
  token: string,
  input: AcceptInviteInput,
): Promise<AcceptInviteResult> {
  const invite = await findInviteTokenByToken(token);
  if (invite.usedAt) throw new NotFoundError('Invite link is no longer valid');
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    throw new NotFoundError('Invite link has expired');
  }
  if (!invite.otpHash || !invite.otpExpiresAt) {
    throw new UnauthorizedError('Request a verification code first');
  }
  if (new Date(invite.otpExpiresAt).getTime() < Date.now()) {
    throw new UnauthorizedError('Verification code has expired');
  }

  const otpValid = await verifyOtp(input.otp, invite.otpHash);
  if (!otpValid) throw new UnauthorizedError('Incorrect verification code');

  const passwordHash = await hashPassword(input.password);
  const user = await activateInvitedUser(invite.userId, input.displayName, passwordHash);
  await markInviteTokenUsed(token);

  const account = await findAccountById(user.accountId);
  const role = user.roleId ? await findRoleByIdScoped(user.roleId, account.id) : null;
  const permissions = resolvePermissions(account, role);
  const sessionToken = signSessionToken({ userId: user.id, accountId: account.id });

  return { user, account, role, permissions, token: sessionToken };
}
