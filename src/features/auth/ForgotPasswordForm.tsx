'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/FormField';
import { useForgotPassword } from '@/hooks/useAuthMutations';

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    forgotPassword.mutate({ email }, { onSuccess: () => setSubmitted(true) });
  }

  if (submitted) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Check your email</h1>
        <p className="mt-2 text-sm text-slate-600">
          If an account exists for {email}, we&apos;ve sent a link to reset your password.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Forgot your password?</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter your email and we&apos;ll send you a reset link.
      </p>

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
        <Button type="submit" isLoading={forgotPassword.isPending} className="w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/sign-in" className="font-medium text-indigo-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
