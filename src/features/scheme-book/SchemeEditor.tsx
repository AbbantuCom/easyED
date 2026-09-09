'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAddSchemeWeek,
  useDeleteScheme,
  useDeleteSchemeWeek,
  useScheme,
  useUpdateScheme,
  useUpdateSchemeWeek,
} from '@/hooks/useSchemes';
import { useHasPermission } from '@/features/auth/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { TextInput, TextAreaField } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SkeletonList } from '@/components/ui/Skeleton';
import type { SchemeWeek } from '@/types';

interface LocalWeek {
  localId: string;
  id?: string;
  week: number;
  theme: string;
  topic: string;
  competency: string;
  teacherActivities: string;
  learnerActivities: string;
  materials: string;
  assessment: string;
  remarks: string;
}

function toLocalWeek(week: SchemeWeek): LocalWeek {
  return { ...week, localId: week.id };
}

function blankWeek(nextNumber: number): LocalWeek {
  return {
    localId: `new-${Date.now()}-${Math.random()}`,
    week: nextNumber,
    theme: '',
    topic: '',
    competency: '',
    teacherActivities: '',
    learnerActivities: '',
    materials: '',
    assessment: '',
    remarks: '',
  };
}

export function SchemeEditor({ schemeId }: { schemeId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const canEdit = useHasPermission('scheme.edit');
  const canDelete = useHasPermission('scheme.delete');

  const { data, isLoading, isError } = useScheme(schemeId);
  const updateScheme = useUpdateScheme(schemeId);
  const addWeek = useAddSchemeWeek(schemeId);
  const updateWeek = useUpdateSchemeWeek(schemeId);
  const deleteWeek = useDeleteSchemeWeek(schemeId);
  const deleteScheme = useDeleteScheme();

  const [klass, setKlass] = useState('');
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');
  const [weeks, setWeeks] = useState<LocalWeek[]>([]);
  const [saving, setSaving] = useState(false);
  const [weekPendingDelete, setWeekPendingDelete] = useState<LocalWeek | null>(null);
  const [confirmDeleteScheme, setConfirmDeleteScheme] = useState(false);

  // Hydrate local editing state from the server exactly once. After that, this
  // component is the source of truth (explicit Save, not autosave) — re-syncing
  // on every background refetch would race a stale response against in-flight
  // saves and could wipe out changes the user just made.
  const hydrated = useRef(false);
  useEffect(() => {
    if (data && !hydrated.current) {
      hydrated.current = true;
      setKlass(data.scheme.klass);
      setSubject(data.scheme.subject);
      setTerm(data.scheme.term);
      setYear(String(data.scheme.year));
      setWeeks(data.weeks.map(toLocalWeek));
    }
  }, [data]);

  if (isLoading) return <SkeletonList rows={4} />;
  if (isError || !data) return <p className="text-sm text-red-600">Could not load this scheme.</p>;

  function updateWeekField(localId: string, field: keyof LocalWeek, value: string | number) {
    setWeeks((prev) =>
      prev.map((w) => (w.localId === localId ? { ...w, [field]: value } : w)),
    );
  }

  function handleAddWeek() {
    const nextNumber = weeks.length > 0 ? Math.max(...weeks.map((w) => w.week)) + 1 : 1;
    setWeeks((prev) => [...prev, blankWeek(nextNumber)]);
  }

  function requestDeleteWeek(week: LocalWeek) {
    if (!week.id) {
      setWeeks((prev) => prev.filter((w) => w.localId !== week.localId));
      return;
    }
    setWeekPendingDelete(week);
  }

  async function confirmDeleteWeek() {
    if (!weekPendingDelete?.id) return;
    try {
      await deleteWeek.mutateAsync(weekPendingDelete.id);
      setWeeks((prev) => prev.filter((w) => w.localId !== weekPendingDelete.localId));
      showToast('Week deleted', 'success');
    } catch {
      showToast('Could not delete week', 'error');
    } finally {
      setWeekPendingDelete(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateScheme.mutateAsync({ klass, subject, term, year: Number(year) });

      for (const week of weeks) {
        const payload = {
          week: week.week,
          theme: week.theme,
          topic: week.topic,
          competency: week.competency,
          teacherActivities: week.teacherActivities,
          learnerActivities: week.learnerActivities,
          materials: week.materials,
          assessment: week.assessment,
          remarks: week.remarks,
        };
        if (week.id) {
          await updateWeek.mutateAsync({ weekId: week.id, input: payload });
        } else {
          const { week: created } = await addWeek.mutateAsync(payload);
          setWeeks((prev) =>
            prev.map((w) => (w.localId === week.localId ? { ...w, id: created.id } : w)),
          );
        }
      }

      showToast('Scheme saved', 'success');
    } catch {
      showToast('Could not save all changes. Please try again.', 'error');
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

  const fields: { key: keyof LocalWeek; label: string; multiline?: boolean }[] = [
    { key: 'theme', label: 'Theme' },
    { key: 'topic', label: 'Topic' },
    { key: 'competency', label: 'Competency / Learning outcome', multiline: true },
    { key: 'teacherActivities', label: 'Teacher activities', multiline: true },
    { key: 'learnerActivities', label: 'Learner activities', multiline: true },
    { key: 'materials', label: 'Materials', multiline: true },
    { key: 'assessment', label: 'Assessment / Evaluation', multiline: true },
    { key: 'remarks', label: 'Remarks', multiline: true },
  ];

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
          <Button variant="secondary" onClick={handleAddWeek}>
            Add week
          </Button>
        )}
      </div>

      {weeks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
          No weeks yet. Add your first week to start building this scheme.
        </p>
      ) : (
        <>
          {/* Desktop: horizontally scrollable table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Week</th>
                  {fields.map((f) => (
                    <th key={f.key} className="min-w-[180px] px-3 py-2 text-left font-medium text-slate-600">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weeks.map((week) => (
                  <tr key={week.localId}>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="number"
                        value={week.week}
                        disabled={!canEdit}
                        onChange={(e) => updateWeekField(week.localId, 'week', Number(e.target.value))}
                        className="w-16 rounded-md border border-slate-300 px-2 py-1"
                      />
                    </td>
                    {fields.map((f) => (
                      <td key={f.key} className="px-3 py-2 align-top">
                        <textarea
                          value={week[f.key] as string}
                          disabled={!canEdit}
                          onChange={(e) => updateWeekField(week.localId, f.key, e.target.value)}
                          rows={2}
                          className="w-full min-w-[160px] resize-y rounded-md border border-slate-300 px-2 py-1"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 align-top">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => requestDeleteWeek(week)}
                          aria-label={`Delete week ${week.week}`}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          &times;
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-4 md:hidden">
            {weeks.map((week) => (
              <div key={week.localId} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    Week
                    <input
                      type="number"
                      value={week.week}
                      disabled={!canEdit}
                      onChange={(e) => updateWeekField(week.localId, 'week', Number(e.target.value))}
                      className="w-16 rounded-md border border-slate-300 px-2 py-1"
                    />
                  </label>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => requestDeleteWeek(week)}
                      aria-label={`Delete week ${week.week}`}
                      className="rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {fields.map((f) => (
                    <TextAreaField
                      key={f.key}
                      label={f.label}
                      value={week[f.key] as string}
                      disabled={!canEdit}
                      onChange={(e) => updateWeekField(week.localId, f.key, e.target.value)}
                      rows={2}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(weekPendingDelete)}
        title="Delete this week?"
        description="This will permanently remove this week from the scheme book."
        isLoading={deleteWeek.isPending}
        onConfirm={confirmDeleteWeek}
        onCancel={() => setWeekPendingDelete(null)}
      />

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
