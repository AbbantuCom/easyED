import jwt from 'jsonwebtoken';

export interface SessionPayload {
  userId: string;
  accountId: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function getSessionExpirySeconds(): number {
  const days = Number(process.env.JWT_EXPIRY_DAYS ?? '7');
  return days * 24 * 60 * 60;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: getSessionExpirySeconds() });
}

export function verifySessionToken(token: string): SessionPayload {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded === 'string' || !('userId' in decoded) || !('accountId' in decoded)) {
    throw new Error('Invalid token payload');
  }
  return { userId: decoded.userId as string, accountId: decoded.accountId as string };
}
