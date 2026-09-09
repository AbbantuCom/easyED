import { PERMISSIONS, type Permission } from '@/lib/constants';

const PERMISSION_LABELS: Record<Permission, string> = {
  'scheme.create': 'Create scheme books',
  'scheme.edit': 'Edit scheme books',
  'scheme.delete': 'Delete scheme books',
  'scheme.view': 'View scheme books',
  'lesson.create': 'Create lesson plans',
  'lesson.edit': 'Edit lesson plans',
  'lesson.delete': 'Delete lesson plans',
  'lesson.view': 'View lesson plans',
  'staff.invite': 'Invite staff',
  'staff.remove': 'Remove staff',
  'role.manage': 'Manage roles',
  'account.manage': 'Manage account settings',
};

export function RoleCheckboxGrid({
  selected,
  onChange,
  disabled,
}: {
  selected: Permission[];
  onChange: (permissions: Permission[]) => void;
  disabled?: boolean;
}) {
  function toggle(permission: Permission) {
    if (selected.includes(permission)) {
      onChange(selected.filter((p) => p !== permission));
    } else {
      onChange([...selected, permission]);
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {PERMISSIONS.map((permission) => (
        <label key={permission} className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={selected.includes(permission)}
            disabled={disabled}
            onChange={() => toggle(permission)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          {PERMISSION_LABELS[permission]}
        </label>
      ))}
    </div>
  );
}
