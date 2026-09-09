'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/providers/ToastProvider';
import { useResetPassword } from '@/hooks/useAuthMutations';
import { ApiError } from '@/lib/api-client';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const resetPassword = useResetPassword();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Invalid reset link</h1>
        <p className="mt-2 text-sm text-slate-600">
          This password reset link is missing or invalid.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    resetPassword.mutate(
      { token, newPassword },
      {
        onSuccess: () => {
          showToast('Password updated. Please sign in.', 'success');
          router.push('/sign-in');
        },
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : 'Something went wrong.');
        },
      },
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Reset your password</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <TextInput
          label="New password"
          type="password"
          name="newPassword"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <TextInput
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" isLoading={resetPassword.isPending} className="w-full">
          Reset password
        </Button>
      </form>
    </div>
  );
}
