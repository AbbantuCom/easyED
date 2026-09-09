'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/providers/ToastProvider';
import { useRemoveStaff, useRoles, useStaff, useUpdateStaffRole } from '@/hooks/useStaff';
import { useAuth, useHasPermission } from '@/features/auth/AuthProvider';
import type { User } from '@/types';

export function StaffTab() {
  const { user: currentUser } = useAuth();
  const canInvite = useHasPermission('staff.invite');
  const canManageRole = useHasPermission('role.manage');
  const canRemove = useHasPermission('staff.remove');

  const staff = useStaff();
  const roles = useRoles();
  const updateRole = useUpdateStaffRole();
  const removeStaff = useRemoveStaff();
  const { showToast } = useToast();

  const [staffPendingRemoval, setStaffPendingRemoval] = useState<User | null>(null);

  const roleNameById = new Map((roles.data?.roles ?? []).map((role) => [role.id, role.name]));

  function handleRoleChange(userId: string, roleId: string) {
    updateRole.mutate(
      { userId, roleId },
      {
        onSuccess: () => showToast('Role updated', 'success'),
        onError: () => showToast('Could not update role', 'error'),
      },
    );
  }

  async function handleConfirmRemove() {
    if (!staffPendingRemoval) return;
    try {
      await removeStaff.mutateAsync(staffPendingRemoval.id);
      showToast('Staff member removed', 'success');
    } catch {
      showToast('Could not remove staff member', 'error');
    } finally {
      setStaffPendingRemoval(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Staff</h2>
        {canInvite && (
          <Link href="/staff/invite">
            <Button>Invite staff</Button>
          </Link>
        )}
      </div>

      {staff.isLoading && <SkeletonList rows={3} />}
      {staff.isError && <p className="text-sm text-red-600">Could not load staff.</p>}

      {staff.data && staff.data.staff.length === 0 && (
        <EmptyState
          title="No staff yet"
          description="Invite teachers and academic heads to join your school's account."
          action={
            canInvite && (
              <Link href="/staff/invite">
                <Button>Invite staff</Button>
              </Link>
            )
          }
        />
      )}

      {staff.data && staff.data.staff.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Email</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Role</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.data.staff.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{member.displayName}</td>
                  <td className="px-4 py-3 text-slate-600">{member.email}</td>
                  <td className="px-4 py-3">
                    {canManageRole && member.id !== currentUser.id ? (
                      <SelectField
                        label={`Role for ${member.displayName}`}
                        hideLabel
                        id={`role-${member.id}`}
                        value={member.roleId ?? ''}
                        onChange={(value) => handleRoleChange(member.id, value)}
                        options={(roles.data?.roles ?? []).map((role) => ({
                          value: role.id,
                          label: role.name,
                        }))}
                      />
                    ) : (
                      <Badge tone="info">
                        {member.roleId ? roleNameById.get(member.roleId) ?? 'Unknown' : '—'}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={member.status === 'active' ? 'success' : 'warning'}>
                      {member.status === 'active' ? 'Active' : 'Invited'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {canRemove && member.id !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => setStaffPendingRemoval(member)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(staffPendingRemoval)}
        title="Remove this staff member?"
        description={`${staffPendingRemoval?.displayName ?? ''} will lose access to this account.`}
        isLoading={removeStaff.isPending}
        onConfirm={handleConfirmRemove}
        onCancel={() => setStaffPendingRemoval(null)}
      />
    </div>
  );
}
