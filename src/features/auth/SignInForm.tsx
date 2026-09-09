'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/providers/ToastProvider';
import { useLogin } from '@/hooks/useAuthMutations';
import { ApiError } from '@/lib/api-client';

export function SignInForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push('/dashboard');
          router.refresh();
        },
        onError: (error) => {
          setFormError(error instanceof ApiError ? error.message : 'Something went wrong.');
          showToast('Sign in failed', 'error');
        },
      },
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-600">Welcome back to easyEd.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <TextInput
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextInput
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {formError && (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={login.isPending} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm text-slate-600">
        <Link href="/forgot-password" className="font-medium text-indigo-600 hover:underline">
          Forgot your password?
        </Link>
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-medium text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
