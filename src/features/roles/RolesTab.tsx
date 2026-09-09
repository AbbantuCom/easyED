'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SkeletonList } from '@/components/ui/Skeleton';
import { useToast } from '@/components/providers/ToastProvider';
import { useDeleteRole, useRoles, useUpdateRole } from '@/hooks/useStaff';
import { useHasPermission } from '@/features/auth/AuthProvider';
import { RoleCheckboxGrid } from '@/features/roles/RoleCheckboxGrid';
import type { Permission } from '@/lib/constants';
import type { Role } from '@/types';

function RoleRow({ role }: { role: Role }) {
  const { showToast } = useToast();
  const canManage = useHasPermission('role.manage');
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [expanded, setExpanded] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>(role.permissions);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    try {
      await updateRole.mutateAsync({ id: role.id, input: { permissions } });
      showToast('Role updated', 'success');
    } catch {
      showToast('Could not update role', 'error');
    }
  }

  async function handleDelete() {
    try {
      await deleteRole.mutateAsync(role.id);
      showToast('Role deleted', 'success');
    } catch {
      showToast('Could not delete role', 'error');
    } finally {
      setConfirmDelete(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-medium text-slate-900">
          {role.name}
          {role.isSuperAdmin && <Badge tone="info">Super Admin</Badge>}
        </span>
        <span className="text-sm text-slate-500">{expanded ? 'Hide' : 'Show'} permissions</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4">
          <RoleCheckboxGrid
            selected={permissions}
            onChange={setPermissions}
            disabled={!canManage || role.isSuperAdmin}
          />
          {canManage && !role.isSuperAdmin && (
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                Delete role
              </Button>
              <Button onClick={handleSave} isLoading={updateRole.isPending}>
                Save permissions
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this role?"
        description="Staff assigned to this role will need to be reassigned."
        isLoading={deleteRole.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function RolesTab() {
  const roles = useRoles();
  const canManage = useHasPermission('role.manage');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Roles</h2>
        {canManage && (
          <Link href="/staff/roles/new">
            <Button>New role</Button>
          </Link>
        )}
      </div>

      {roles.isLoading && <SkeletonList rows={3} />}
      {roles.isError && <p className="text-sm text-red-600">Could not load roles.</p>}

      {roles.data && (
        <div className="flex flex-col gap-3">
          {roles.data.roles.map((role) => (
            <RoleRow key={role.id} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
