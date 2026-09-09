import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { startTestDb, clearTestDb, stopTestDb } from '../setup/db';

describe('POST /api/invites/[token]/accept', () => {
  beforeAll(async () => {
    await startTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await stopTestDb();
  });

  async function setUpInvite(otpExpiresInMs: number | null) {
    const { createAccount } = await import('@/repositories/accountRepository');
    const { createRole } = await import('@/repositories/roleRepository');
    const { createUser } = await import('@/repositories/userRepository');
    const { createInviteToken, setInviteOtp } = await import('@/repositories/inviteTokenRepository');
    const { hashPassword } = await import('@/lib/password');
    const { hashOtp, generateToken } = await import('@/lib/otp');

    const account = await createAccount('school', 'Invite Test School');
    const role = await createRole({
      accountId: account.id,
      name: 'Teacher',
      permissions: ['lesson.view'],
    });
    const user = await createUser({
      accountId: account.id,
      email: 'invitee@example.com',
      displayName: 'invitee@example.com',
      passwordHash: await hashPassword(generateToken()),
      roleId: role.id,
      status: 'invited',
      invitedAt: new Date(),
    });

    const token = generateToken();
    await createInviteToken({
      token,
      userId: user.id,
      accountId: account.id,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    });

    const otp = '123456';
    if (otpExpiresInMs !== null) {
      await setInviteOtp(token, await hashOtp(otp), new Date(Date.now() + otpExpiresInMs));
    }

    return { token, otp };
  }

  async function callAccept(token: string, body: Record<string, unknown>) {
    const { POST } = await import('@/app/api/invites/[token]/accept/route');
    return POST(
      new Request(`http://localhost/api/invites/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ token }) },
    );
  }

  it('activates the account with a valid, unexpired OTP', async () => {
    const { token, otp } = await setUpInvite(15 * 60 * 1000);

    const response = await callAccept(token, {
      displayName: 'Invitee Name',
      password: 'BrandNewPassword123',
      otp,
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.user.displayName).toBe('Invitee Name');
    expect(body.user.status).toBe('active');
    expect(response.headers.get('set-cookie')).toContain('easyed_session=');
  });

  it('rejects an expired OTP', async () => {
    const { token, otp } = await setUpInvite(-1000); // already expired

    const response = await callAccept(token, {
      displayName: 'Invitee Name',
      password: 'BrandNewPassword123',
      otp,
    });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/expired/i);
  });

  it('rejects a token that has already been used', async () => {
    const { token, otp } = await setUpInvite(15 * 60 * 1000);

    const first = await callAccept(token, {
      displayName: 'Invitee Name',
      password: 'BrandNewPassword123',
      otp,
    });
    expect(first.status).toBe(200);

    const second = await callAccept(token, {
      displayName: 'Invitee Name Again',
      password: 'AnotherPassword123',
      otp,
    });

    expect(second.status).toBe(404);
    const body = await second.json();
    expect(body.error).toMatch(/no longer valid/i);
  });
});
