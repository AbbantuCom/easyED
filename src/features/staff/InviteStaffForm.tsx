'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SelectField, TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/providers/ToastProvider';
import { useInviteStaff, useRoles } from '@/hooks/useStaff';
import { ApiError } from '@/lib/api-client';
import type { FieldErrors } from '@/types';

export function InviteStaffForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const roles = useRoles();
  const inviteStaff = useInviteStaff();

  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    inviteStaff.mutate(
      { email, roleId },
      {
        onSuccess: () => {
          showToast('Invite sent', 'success');
          router.push('/staff');
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) {
            setFieldErrors(error.fieldErrors);
          } else {
            showToast(error instanceof ApiError ? error.message : 'Could not send invite', 'error');
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Invite staff member</h1>

      <Card className="max-w-md p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <TextInput
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
          />
          <SelectField
            label="Role"
            name="roleId"
            value={roleId}
            onChange={setRoleId}
            placeholder="Select a role"
            options={(roles.data?.roles ?? []).map((role) => ({ value: role.id, label: role.name }))}
            error={fieldErrors.roleId}
            required
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push('/staff')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={inviteStaff.isPending}>
              Send invite
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
