import { AcceptInviteForm } from '@/features/auth/AcceptInviteForm';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  return <AcceptInviteForm token={token ?? ''} />;
}
