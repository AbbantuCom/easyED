import { createAccount } from '@/repositories/accountRepository';
import { createUser } from '@/repositories/userRepository';
import { hashPassword } from '@/lib/password';
import { signSessionToken } from '@/lib/jwt';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

export async function createAuthenticatedFixture(email = 'owner@example.com') {
  const account = await createAccount('individual', 'Test Individual Account');
  const user = await createUser({
    accountId: account.id,
    email,
    displayName: 'Test Owner',
    passwordHash: await hashPassword('irrelevant-password-123'),
    status: 'active',
  });

  const token = signSessionToken({ userId: user.id, accountId: account.id });

  return {
    account,
    user,
    cookieHeader: `${SESSION_COOKIE_NAME}=${token}`,
  };
}

export function authedRequest(
  url: string,
  cookieHeader: string,
  init: { method?: string; body?: unknown } = {},
): Request {
  return new Request(url, {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}
