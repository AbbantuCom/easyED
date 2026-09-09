'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/providers/ToastProvider';
import { useRegister } from '@/hooks/useAuthMutations';
import { ApiError } from '@/lib/api-client';
import type { FieldErrors } from '@/types';

type AccountChoice = 'individual' | 'school';

export function SignUpForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const register = useRegister();

  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<AccountChoice | null>(null);

  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function chooseType(choice: AccountChoice) {
    setType(choice);
    setStep(2);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!type) return;
    setFieldErrors({});

    const input =
      type === 'individual'
        ? { type: 'individual' as const, name, email, password }
        : { type: 'school' as const, schoolName, displayName, email, password };

    register.mutate(input, {
      onSuccess: () => {
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
    });
  }

  if (step === 1) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">How will you be using easyEd?</p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => chooseType('individual')}
            className="rounded-xl border border-slate-300 p-4 text-left hover:border-indigo-500 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <p className="font-semibold text-slate-900">I&apos;m a private teacher</p>
            <p className="mt-1 text-sm text-slate-600">
              Manage your own scheme books and lesson plans.
            </p>
          </button>
          <button
            type="button"
            onClick={() => chooseType('school')}
            className="rounded-xl border border-slate-300 p-4 text-left hover:border-indigo-500 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <p className="font-semibold text-slate-900">I&apos;m registering a school</p>
            <p className="mt-1 text-sm text-slate-600">
              Invite staff and manage scheme books centrally.
            </p>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setStep(1)}
        className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        &larr; Back
      </button>
      <h1 className="text-xl font-semibold text-slate-900">
        {type === 'individual' ? 'Set up your teacher account' : 'Set up your school account'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {type === 'individual' ? (
          <TextInput
            label="Your name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
          />
        ) : (
          <>
            <TextInput
              label="School name"
              name="schoolName"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              error={fieldErrors.schoolName}
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
          </>
        )}
        <TextInput
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
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

        <Button type="submit" isLoading={register.isPending} className="w-full">
          Create account
        </Button>
      </form>
    </div>
  );
}
