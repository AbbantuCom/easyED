'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateLesson, useLesson, useUpdateLesson } from '@/hooks/useLessons';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextInput, TextAreaField } from '@/components/ui/FormField';
import { SkeletonList } from '@/components/ui/Skeleton';
import { SchemeWeekPicker } from '@/features/lesson-plan/SchemeWeekPicker';
import { ApiError } from '@/lib/api-client';
import { BLANK_LESSON_VALUES, LESSON_DETAIL_TEXT_FIELDS, type LessonFormValues } from '@/features/lesson-plan/lessonFields';
import type { FieldErrors } from '@/types';
import type { SchemeWeekOption } from '@/services/schemeService';

export function LessonFormPage({ lessonId }: { lessonId?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(lessonId);

  const { data, isLoading, isError } = useLesson(lessonId);
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson(lessonId ?? '');

  const [values, setValues] = useState<LessonFormValues>(BLANK_LESSON_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPicker, setShowPicker] = useState(!isEdit);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!isEdit || !data || hydrated.current) return;
    hydrated.current = true;
    const lesson = data.lesson;
    setValues({
      date: lesson.date.slice(0, 10),
      klass: lesson.klass,
      subject: lesson.subject,
      theme: lesson.theme,
      topic: lesson.topic,
      duration: lesson.duration,
      numLearners: String(lesson.numLearners),
      competency: lesson.competency,
      introduction: lesson.introduction,
      teacherActivities: lesson.teacherActivities,
      learnerActivities: lesson.learnerActivities,
      materials: lesson.materials,
      assessment: lesson.assessment,
      conclusion: lesson.conclusion,
      reflection: lesson.reflection,
    });
  }, [data, isEdit]);

  if (isEdit && isLoading) return <SkeletonList rows={4} />;
  if (isEdit && (isError || !data)) {
    return <p className="text-sm text-red-600">Could not load this lesson.</p>;
  }

  function updateField(field: keyof LessonFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handlePullFromScheme(option: SchemeWeekOption) {
    setValues((prev) => ({
      ...prev,
      klass: option.klass,
      subject: option.subject,
      theme: option.theme,
      topic: option.topic,
      competency: option.competency,
    }));
    if (isEdit) setShowPicker(false);
    showToast('Pulled details from scheme week', 'success');
  }

  function goToCancelTarget() {
    router.push(isEdit ? `/lessons/${lessonId}` : '/lessons');
  }

  const isPending = createLesson.isPending || updateLesson.isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const payload = { ...values, numLearners: Number(values.numLearners) };

    if (isEdit && lessonId) {
      updateLesson.mutate(payload, {
        onSuccess: () => {
          showToast('Lesson plan saved', 'success');
          router.push(`/lessons/${lessonId}`);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) setFieldErrors(error.fieldErrors);
          else showToast('Could not save lesson plan', 'error');
        },
      });
    } else {
      createLesson.mutate(payload, {
        onSuccess: ({ lesson }) => {
          showToast('Lesson plan created', 'success');
          router.push(`/lessons/${lesson.id}`);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) setFieldErrors(error.fieldErrors);
          else showToast(error instanceof ApiError ? error.message : 'Could not create lesson', 'error');
        },
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? 'Edit lesson plan' : 'New lesson plan'}
      </h1>

      <Card className="max-w-lg p-6">
        {isEdit ? (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              {showPicker ? 'Hide' : 'Pull from scheme week'}
            </button>
            {showPicker && (
              <div className="mt-3">
                <SchemeWeekPicker onSelect={handlePullFromScheme} />
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <SchemeWeekPicker onSelect={handlePullFromScheme} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <TextInput
            label="Date"
            type="date"
            value={values.date}
            onChange={(e) => updateField('date', e.target.value)}
            error={fieldErrors.date}
            required
          />
          <TextInput
            label="Class"
            value={values.klass}
            onChange={(e) => updateField('klass', e.target.value)}
            error={fieldErrors.klass}
            required
          />
          <TextInput
            label="Subject"
            value={values.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            error={fieldErrors.subject}
            required
          />
          <TextInput
            label="Theme"
            value={values.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            error={fieldErrors.theme}
          />
          <TextInput
            label="Topic"
            value={values.topic}
            onChange={(e) => updateField('topic', e.target.value)}
            error={fieldErrors.topic}
            required
          />
          <TextInput
            label="Duration"
            placeholder="e.g. 40 minutes"
            value={values.duration}
            onChange={(e) => updateField('duration', e.target.value)}
            error={fieldErrors.duration}
            required
          />
          <TextInput
            label="Number of learners"
            type="number"
            value={values.numLearners}
            onChange={(e) => updateField('numLearners', e.target.value)}
            error={fieldErrors.numLearners}
            required
          />

          {LESSON_DETAIL_TEXT_FIELDS.map((field) => (
            <TextAreaField
              key={field.key}
              label={field.label}
              value={values[field.key]}
              onChange={(e) => updateField(field.key, e.target.value)}
              rows={3}
            />
          ))}

          <div className="mt-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={goToCancelTarget}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              {isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
