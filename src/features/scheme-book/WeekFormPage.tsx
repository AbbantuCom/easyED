'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAddSchemeWeek, useScheme, useUpdateSchemeWeek } from '@/hooks/useSchemes';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextInput, TextAreaField } from '@/components/ui/FormField';
import { SkeletonList } from '@/components/ui/Skeleton';
import { BLANK_WEEK_VALUES, WEEK_TEXT_FIELDS, type WeekFormValues } from '@/features/scheme-book/weekFields';

export function WeekFormPage({ schemeId, weekId }: { schemeId: string; weekId?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { data, isLoading, isError } = useScheme(schemeId);
  const addWeek = useAddSchemeWeek(schemeId);
  const updateWeek = useUpdateSchemeWeek(schemeId);
  const isEdit = Boolean(weekId);

  const [values, setValues] = useState<WeekFormValues>({ week: 1, ...BLANK_WEEK_VALUES });
  const hydrated = useRef(false);

  useEffect(() => {
    if (!data || hydrated.current) return;
    hydrated.current = true;

    const existingWeek = isEdit ? data.weeks.find((w) => w.id === weekId) : undefined;
    const nextNumber = data.weeks.length > 0 ? Math.max(...data.weeks.map((w) => w.week)) + 1 : 1;

    setValues(
      existingWeek
        ? {
            week: existingWeek.week,
            theme: existingWeek.theme,
            topic: existingWeek.topic,
            competency: existingWeek.competency,
            teacherActivities: existingWeek.teacherActivities,
            learnerActivities: existingWeek.learnerActivities,
            materials: existingWeek.materials,
            assessment: existingWeek.assessment,
            remarks: existingWeek.remarks,
          }
        : { week: nextNumber, ...BLANK_WEEK_VALUES },
    );
  }, [data, isEdit, weekId]);

  if (isLoading) return <SkeletonList rows={4} />;
  if (isError || !data) return <p className="text-sm text-red-600">Could not load this scheme.</p>;

  if (isEdit && !data.weeks.some((w) => w.id === weekId)) {
    return <p className="text-sm text-red-600">This week could not be found.</p>;
  }

  function updateField(field: keyof WeekFormValues, value: string | number) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  const isPending = addWeek.isPending || updateWeek.isPending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      if (isEdit && weekId) {
        await updateWeek.mutateAsync({ weekId, input: values });
        showToast('Week updated', 'success');
        router.push(`/schemes/${schemeId}/weeks/${weekId}`);
      } else {
        const { week: created } = await addWeek.mutateAsync(values);
        showToast('Week added', 'success');
        router.push(`/schemes/${schemeId}/weeks/${created.id}`);
      }
    } catch {
      showToast(isEdit ? 'Could not update week' : 'Could not add week', 'error');
    }
  }

  function handleCancel() {
    if (isEdit && weekId) {
      router.push(`/schemes/${schemeId}/weeks/${weekId}`);
    } else {
      router.push(`/schemes/${schemeId}`);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? `Edit week ${values.week}` : 'Add a week'}
      </h1>

      <Card className="max-w-lg p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <TextInput
            label="Week number"
            type="number"
            min={1}
            value={values.week}
            onChange={(e) => updateField('week', Number(e.target.value))}
            required
          />
          {WEEK_TEXT_FIELDS.map((field) => (
            <TextAreaField
              key={field.key}
              label={field.label}
              value={values[field.key]}
              onChange={(e) => updateField(field.key, e.target.value)}
              rows={3}
            />
          ))}

          <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              {isEdit ? 'Save changes' : 'Add week'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
