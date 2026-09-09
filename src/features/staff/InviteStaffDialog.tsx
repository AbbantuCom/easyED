'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { SelectField, TextInput } from '@/components/ui/FormField';
import { useToast } from '@/components/providers/ToastProvider';
import { useInviteStaff, useRoles } from '@/hooks/useStaff';
import { ApiError } from '@/lib/api-client';
import type { FieldErrors } from '@/types';

export function InviteStaffDialog({ onClose }: { onClose: () => void }) {
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
          onClose();
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-staff-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="invite-staff-title" className="text-base font-semibold text-slate-900">
          Invite staff member
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
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
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={inviteStaff.isPending}>
              Send invite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
