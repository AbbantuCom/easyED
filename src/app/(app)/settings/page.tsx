'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useHasPermission } from '@/features/auth/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/providers/ToastProvider';
import { useChangePassword, useUpdateAccountName, useUpdateDisplayName } from '@/hooks/useSettings';
import { ApiError } from '@/lib/api-client';
import type { FieldErrors } from '@/types';

function DisplayNameForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const updateDisplayName = useUpdateDisplayName();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    updateDisplayName.mutate(
      { displayName },
      {
        onSuccess: () => {
          showToast('Name updated', 'success');
          router.refresh();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) setErrors(error.fieldErrors);
          else showToast('Could not update name', 'error');
        },
      },
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-slate-900">Your name</h2>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
        <TextInput
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
          required
        />
        <Button type="submit" isLoading={updateDisplayName.isPending} className="self-start">
          Save
        </Button>
      </form>
    </Card>
  );
}

function AccountNameForm() {
  const { account } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const updateAccountName = useUpdateAccountName();
  const [name, setName] = useState(account.name);
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    updateAccountName.mutate(
      { name },
      {
        onSuccess: () => {
          showToast('Account name updated', 'success');
          router.refresh();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) setErrors(error.fieldErrors);
          else showToast('Could not update account name', 'error');
        },
      },
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-slate-900">
        {account.type === 'school' ? 'School name' : 'Account name'}
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        <Button type="submit" isLoading={updateAccountName.isPending} className="self-start">
          Save
        </Button>
      </form>
    </Card>
  );
}

function ChangePasswordForm() {
  const { showToast } = useToast();
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          showToast('Password updated', 'success');
          setCurrentPassword('');
          setNewPassword('');
        },
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : 'Could not update password');
        },
      },
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-slate-900">Change password</h2>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
        <TextInput
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <TextInput
          label="New password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" isLoading={changePassword.isPending} className="self-start">
          Update password
        </Button>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  const canManageAccount = useHasPermission('account.manage');

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <DisplayNameForm />
      {canManageAccount && <AccountNameForm />}
      <ChangePasswordForm />
    </div>
  );
}
