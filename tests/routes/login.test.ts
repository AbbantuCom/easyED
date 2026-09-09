import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { startTestDb, clearTestDb, stopTestDb } from '../setup/db';

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await startTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await stopTestDb();
  });

  async function registerActiveUser(email: string, password: string) {
    const { registerAccount } = await import('@/services/authService');
    return registerAccount({ type: 'individual', name: 'Test Teacher', email, password });
  }

  it('logs in successfully with correct credentials', async () => {
    const email = 'correct@example.com';
    const password = 'CorrectHorse123';
    await registerActiveUser(email, password);

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),
      undefined,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.user.email).toBe(email);
    expect(body.user.passwordHash).toBeUndefined();
    expect(response.headers.get('set-cookie')).toContain('easyed_session=');
  });

  it('rejects an incorrect password with a generic 401', async () => {
    const email = 'wrongpass@example.com';
    await registerActiveUser(email, 'CorrectHorse123');

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'WrongPassword999' }),
      }),
      undefined,
    );

    expect(response.status).toBe(401);
  });

  it('blocks a user whose account is still in "invited" status', async () => {
    const { createAccount } = await import('@/repositories/accountRepository');
    const { createUser } = await import('@/repositories/userRepository');
    const { hashPassword } = await import('@/lib/password');

    const account = await createAccount('school', 'Pending School');
    const email = 'invited@example.com';
    const password = 'SomePassword123';
    await createUser({
      accountId: account.id,
      email,
      displayName: email,
      passwordHash: await hashPassword(password),
      status: 'invited',
      invitedAt: new Date(),
    });

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),
      undefined,
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toMatch(/invite link/i);
  });
});
