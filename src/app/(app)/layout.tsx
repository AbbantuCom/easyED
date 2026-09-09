import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getServerSession } from '@/lib/session';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/sign-in');
  }

  const { user, account, permissions } = session;

  return (
    <AuthProvider session={{ user, account, permissions }}>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
