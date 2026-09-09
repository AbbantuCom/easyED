'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/FormField';
import { RoleCheckboxGrid } from '@/features/roles/RoleCheckboxGrid';
import { useToast } from '@/components/providers/ToastProvider';
import { useCreateRole } from '@/hooks/useStaff';
import { ApiError } from '@/lib/api-client';
import type { Permission } from '@/lib/constants';
import type { FieldErrors } from '@/types';

export function CreateRoleDialog({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const createRole = useCreateRole();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    createRole.mutate(
      { name, permissions },
      {
        onSuccess: () => {
          showToast('Role created', 'success');
          onClose();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) {
            setFieldErrors(error.fieldErrors);
          } else {
            showToast(error instanceof ApiError ? error.message : 'Could not create role', 'error');
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
      aria-labelledby="create-role-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 id="create-role-title" className="text-base font-semibold text-slate-900">
          New role
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
          <TextInput
            label="Role name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
          />
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Permissions</p>
            <RoleCheckboxGrid selected={permissions} onChange={setPermissions} />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createRole.isPending}>
              Create role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
