import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token ?? ''} />;
}
