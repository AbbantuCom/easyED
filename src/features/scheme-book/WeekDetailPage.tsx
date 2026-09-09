'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDeleteSchemeWeek, useScheme } from '@/hooks/useSchemes';
import { useHasPermission } from '@/features/auth/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SkeletonList } from '@/components/ui/Skeleton';
import { WEEK_TEXT_FIELDS } from '@/features/scheme-book/weekFields';

export function WeekDetailPage({ schemeId, weekId }: { schemeId: string; weekId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const canEdit = useHasPermission('scheme.edit');
  const { data, isLoading, isError } = useScheme(schemeId);
  const deleteWeek = useDeleteSchemeWeek(schemeId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <SkeletonList rows={4} />;
  if (isError || !data) return <p className="text-sm text-red-600">Could not load this scheme.</p>;

  const week = data.weeks.find((w) => w.id === weekId);
  if (!week) return <p className="text-sm text-red-600">This week could not be found.</p>;

  async function handleDelete() {
    try {
      await deleteWeek.mutateAsync(weekId);
      showToast('Week deleted', 'success');
      router.push(`/schemes/${schemeId}`);
    } catch {
      showToast('Could not delete week', 'error');
    } finally {
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/schemes/${schemeId}`}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            &larr; Back to scheme
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Week {week.week}</h1>
        </div>
        {canEdit && (
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
            <Link href={`/schemes/${schemeId}/weeks/${weekId}/edit`}>
              <Button>Edit</Button>
            </Link>
          </div>
        )}
      </div>

      <Card className="max-w-lg p-6">
        <dl className="flex flex-col gap-4">
          {WEEK_TEXT_FIELDS.map((field) => (
            <div key={field.key}>
              <dt className="text-sm font-medium text-slate-700">{field.label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                {week[field.key] || <span className="text-slate-400">Not set</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this week?"
        description="This will permanently remove this week from the scheme book."
        isLoading={deleteWeek.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
