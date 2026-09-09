'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDeleteScheme, useScheme, useUpdateScheme } from '@/hooks/useSchemes';
import { useHasPermission } from '@/features/auth/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SkeletonList } from '@/components/ui/Skeleton';

export function SchemeEditor({ schemeId }: { schemeId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const canEdit = useHasPermission('scheme.edit');
  const canDelete = useHasPermission('scheme.delete');

  const { data, isLoading, isError } = useScheme(schemeId);
  const updateScheme = useUpdateScheme(schemeId);
  const deleteScheme = useDeleteScheme();

  const [klass, setKlass] = useState('');
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteScheme, setConfirmDeleteScheme] = useState(false);

  // Hydrate the header form from the server exactly once. After that, this
  // component owns the header fields (explicit Save, not autosave) — weeks
  // themselves are never mirrored into local state, so the table always
  // reflects the latest server data straight from the query.
  const hydrated = useRef(false);
  useEffect(() => {
    if (data && !hydrated.current) {
      hydrated.current = true;
      setKlass(data.scheme.klass);
      setSubject(data.scheme.subject);
      setTerm(data.scheme.term);
      setYear(String(data.scheme.year));
    }
  }, [data]);

  if (isLoading) return <SkeletonList rows={4} />;
  if (isError || !data) return <p className="text-sm text-red-600">Could not load this scheme.</p>;

  const weeks = [...data.weeks].sort((a, b) => a.week - b.week);

  async function handleSave() {
    setSaving(true);
    try {
      await updateScheme.mutateAsync({ klass, subject, term, year: Number(year) });
      showToast('Scheme saved', 'success');
    } catch {
      showToast('Could not save changes. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteScheme() {
    try {
      await deleteScheme.mutateAsync(schemeId);
      showToast('Scheme deleted', 'success');
      router.push('/schemes');
    } catch {
      showToast('Could not delete scheme', 'error');
    } finally {
      setConfirmDeleteScheme(false);
    }
  }

  function goToWeek(weekId: string) {
    router.push(`/schemes/${schemeId}/weeks/${weekId}`);
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, weekId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToWeek(weekId);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Scheme book</h1>
        <div className="flex gap-3">
          {canDelete && (
            <Button variant="danger" onClick={() => setConfirmDeleteScheme(true)}>
              Delete scheme
            </Button>
          )}
          {canEdit && (
            <Button onClick={handleSave} isLoading={saving}>
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <TextInput
          label="Class"
          name="klass"
          value={klass}
          onChange={(e) => setKlass(e.target.value)}
          disabled={!canEdit}
        />
        <TextInput
          label="Subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={!canEdit}
        />
        <TextInput
          label="Term"
          name="term"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          disabled={!canEdit}
        />
        <TextInput
          label="Year"
          name="year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={!canEdit}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Weekly plan</h2>
        {canEdit && (
          <Link href={`/schemes/${schemeId}/weeks/new`}>
            <Button>Add week</Button>
          </Link>
        )}
      </div>

      {weeks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
          No weeks yet. Add your first week to start building this scheme.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-20 px-4 py-2 text-left font-medium text-slate-600">Week</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Theme</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Topic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeks.map((week) => (
                <tr
                  key={week.id}
                  onClick={() => goToWeek(week.id)}
                  onKeyDown={(e) => handleRowKeyDown(e, week.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View week ${week.week}`}
                  className="cursor-pointer hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{week.week}</td>
                  <td className="max-w-50 truncate px-4 py-3 text-slate-700">
                    {week.theme || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="max-w-60 truncate px-4 py-3 text-slate-700">
                    {week.topic || <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteScheme}
        title="Delete this scheme book?"
        description="This will permanently delete the scheme book and all of its weeks."
        isLoading={deleteScheme.isPending}
        onConfirm={handleDeleteScheme}
        onCancel={() => setConfirmDeleteScheme(false)}
      />
    </div>
  );
}
