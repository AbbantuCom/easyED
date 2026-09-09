'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { StaffTab } from '@/features/staff/StaffTab';
import { RolesTab } from '@/features/roles/RolesTab';

type Tab = 'staff' | 'roles';

export default function StaffPage() {
  const { account } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'roles' ? 'roles' : 'staff';

  if (account.type !== 'school') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Staff management is only available for school accounts.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Staff &amp; roles</h1>

      <div className="flex gap-2 border-b border-slate-200">
        {(['staff', 'roles'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => router.push(value === 'staff' ? '/staff' : '/staff?tab=roles')}
            className={`border-b-2 px-4 py-2 text-sm font-medium capitalize ${
              tab === value
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {tab === 'staff' ? <StaffTab /> : <RolesTab />}
    </div>
  );
}
