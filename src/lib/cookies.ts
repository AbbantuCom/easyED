import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { getSessionExpirySeconds } from '@/lib/jwt';

const isProduction = process.env.NODE_ENV === 'production';

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: getSessionExpirySeconds(),
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export function readSessionCookie(request: Request | NextRequest): string | null {
  if ('cookies' in request) {
    return (request as NextRequest).cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  }
  const header = request.headers.get('cookie');
  if (!header) return null;
  const match = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}
