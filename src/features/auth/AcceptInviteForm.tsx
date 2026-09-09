'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/providers/ToastProvider';
import {
  useAcceptInvite,
  useInviteeEmail,
  useRequestInviteOtp,
} from '@/hooks/useAuthMutations';
import { ApiError } from '@/lib/api-client';
import type { FieldErrors } from '@/types';

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const inviteeEmail = useInviteeEmail(token);
  const requestOtp = useRequestInviteOtp(token);
  const acceptInvite = useAcceptInvite(token);

  const [otpSent, setOtpSent] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!token || inviteeEmail.isError) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Invite not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          This invite link is invalid, expired, or has already been used.
        </p>
      </div>
    );
  }

  function handleSendOtp() {
    requestOtp.mutate(undefined, {
      onSuccess: () => {
        setOtpSent(true);
        showToast('Verification code sent', 'success');
      },
      onError: (error) => {
        showToast(error instanceof ApiError ? error.message : 'Could not send code', 'error');
      },
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    acceptInvite.mutate(
      { displayName, password, otp },
      {
        onSuccess: () => {
          showToast('Welcome to easyEd!', 'success');
          router.push('/dashboard');
          router.refresh();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) {
            setFieldErrors(error.fieldErrors);
          } else {
            showToast(error instanceof ApiError ? error.message : 'Something went wrong.', 'error');
          }
        },
      },
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Accept your invite</h1>
      {inviteeEmail.isLoading ? (
        <p className="mt-2 text-sm text-slate-500">Loading invite details…</p>
      ) : (
        <p className="mt-2 text-sm text-slate-600">
          Setting up an account for <span className="font-medium">{inviteeEmail.data?.email}</span>
        </p>
      )}

      <ol className="mt-4 flex gap-4 text-xs font-medium text-slate-500">
        <li className={otpSent ? 'text-indigo-600' : 'text-slate-900'}>1. Verify email</li>
        <li className={otpSent ? 'text-slate-900' : ''}>2. Set up account</li>
      </ol>

      {!otpSent ? (
        <div className="mt-6">
          <p className="text-sm text-slate-600">
            We&apos;ll send a 6-digit verification code to your email address.
          </p>
          <Button
            type="button"
            onClick={handleSendOtp}
            isLoading={requestOtp.isPending}
            className="mt-4 w-full"
          >
            Send verification code
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <TextInput
            label="Verification code"
            name="otp"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            error={fieldErrors.otp}
            required
          />
          <TextInput
            label="Your name"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={fieldErrors.displayName}
            required
          />
          <TextInput
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
          />
          <Button type="submit" isLoading={acceptInvite.isPending} className="w-full">
            Activate account
          </Button>
          <button
            type="button"
            onClick={handleSendOtp}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Resend code
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/sign-in" className="font-medium text-indigo-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
