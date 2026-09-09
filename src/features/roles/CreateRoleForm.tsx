'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextInput } from '@/components/ui/FormField';
import { RoleCheckboxGrid } from '@/features/roles/RoleCheckboxGrid';
import { useToast } from '@/components/providers/ToastProvider';
import { useCreateRole } from '@/hooks/useStaff';
import { ApiError } from '@/lib/api-client';
import type { Permission } from '@/lib/constants';
import type { FieldErrors } from '@/types';

export function CreateRoleForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const createRole = useCreateRole();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function goToRolesTab() {
    router.push('/staff?tab=roles');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    createRole.mutate(
      { name, permissions },
      {
        onSuccess: () => {
          showToast('Role created', 'success');
          goToRolesTab();
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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">New role</h1>

      <Card className="max-w-lg p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
            <Button type="button" variant="secondary" onClick={goToRolesTab}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createRole.isPending}>
              Create role
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
