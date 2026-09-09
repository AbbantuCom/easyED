import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withErrorHandler } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { listStaff } from '@/services/userService';

export const GET = withErrorHandler(async (request: Request) => {
  await connectDB();
  const { account } = await getAuthenticatedUser(request);
  const staff = await listStaff(account.id);
  return NextResponse.json({ staff });
});
