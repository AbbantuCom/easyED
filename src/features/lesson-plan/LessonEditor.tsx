'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteLesson, useLesson, useUpdateLesson } from '@/hooks/useLessons';
import { useHasPermission } from '@/features/auth/AuthProvider';
import { SchemeWeekPicker } from '@/features/lesson-plan/SchemeWeekPicker';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { TextInput, TextAreaField } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SkeletonList } from '@/components/ui/Skeleton';
import type { SchemeWeekOption } from '@/services/schemeService';

interface LessonFormState {
  date: string;
  klass: string;
  subject: string;
  theme: string;
  topic: string;
  duration: string;
  numLearners: string;
  competency: string;
  introduction: string;
  teacherActivities: string;
  learnerActivities: string;
  materials: string;
  assessment: string;
  conclusion: string;
  reflection: string;
}

const EMPTY_FORM: LessonFormState = {
  date: '',
  klass: '',
  subject: '',
  theme: '',
  topic: '',
  duration: '',
  numLearners: '',
  competency: '',
  introduction: '',
  teacherActivities: '',
  learnerActivities: '',
  materials: '',
  assessment: '',
  conclusion: '',
  reflection: '',
};

export function LessonEditor({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const canEdit = useHasPermission('lesson.edit');
  const canDelete = useHasPermission('lesson.delete');

  const { data, isLoading, isError } = useLesson(lessonId);
  const updateLesson = useUpdateLesson(lessonId);
  const deleteLesson = useDeleteLesson();

  const [form, setForm] = useState<LessonFormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Hydrate once from the server; after that this component owns the state
  // (explicit Save, not autosave), so a background refetch must not clobber edits.
  const hydrated = useRef(false);
  useEffect(() => {
    if (data && !hydrated.current) {
      hydrated.current = true;
      const lesson = data.lesson;
      setForm({
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
    }
  }, [data]);

  if (isLoading) return <SkeletonList rows={4} />;
  if (isError || !data) return <p className="text-sm text-red-600">Could not load this lesson.</p>;

  function updateField(field: keyof LessonFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePullFromScheme(option: SchemeWeekOption) {
    setForm((prev) => ({
      ...prev,
      klass: option.klass,
      subject: option.subject,
      theme: option.theme,
      topic: option.topic,
      competency: option.competency,
    }));
    setShowPicker(false);
    showToast('Pulled details from scheme week', 'success');
  }

  async function handleSave() {
    try {
      await updateLesson.mutateAsync({
        ...form,
        numLearners: Number(form.numLearners),
      });
      showToast('Lesson plan saved', 'success');
    } catch {
      showToast('Could not save lesson plan', 'error');
    }
  }

  async function handleDelete() {
    try {
      await deleteLesson.mutateAsync(lessonId);
      showToast('Lesson plan deleted', 'success');
      router.push('/lessons');
    } catch {
      showToast('Could not delete lesson plan', 'error');
    } finally {
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Lesson plan</h1>
        <div className="flex gap-3">
          {canDelete && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )}
          {canEdit && (
            <Button onClick={handleSave} isLoading={updateLesson.isPending}>
              Save
            </Button>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
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
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Lesson information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextInput
            label="Date"
            type="date"
            value={form.date}
            disabled={!canEdit}
            onChange={(e) => updateField('date', e.target.value)}
          />
          <TextInput
            label="Class"
            value={form.klass}
            disabled={!canEdit}
            onChange={(e) => updateField('klass', e.target.value)}
          />
          <TextInput
            label="Subject"
            value={form.subject}
            disabled={!canEdit}
            onChange={(e) => updateField('subject', e.target.value)}
          />
          <TextInput
            label="Theme"
            value={form.theme}
            disabled={!canEdit}
            onChange={(e) => updateField('theme', e.target.value)}
          />
          <TextInput
            label="Topic"
            value={form.topic}
            disabled={!canEdit}
            onChange={(e) => updateField('topic', e.target.value)}
          />
          <TextInput
            label="Duration"
            value={form.duration}
            disabled={!canEdit}
            onChange={(e) => updateField('duration', e.target.value)}
          />
          <TextInput
            label="Number of learners"
            type="number"
            value={form.numLearners}
            disabled={!canEdit}
            onChange={(e) => updateField('numLearners', e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Lesson plan details</h2>
        <div className="mt-4 flex flex-col gap-4">
          <TextAreaField
            label="Learning competency / objective"
            value={form.competency}
            disabled={!canEdit}
            onChange={(e) => updateField('competency', e.target.value)}
          />
          <TextAreaField
            label="Introduction"
            value={form.introduction}
            disabled={!canEdit}
            onChange={(e) => updateField('introduction', e.target.value)}
          />
          <TextAreaField
            label="Teacher activities"
            value={form.teacherActivities}
            disabled={!canEdit}
            onChange={(e) => updateField('teacherActivities', e.target.value)}
          />
          <TextAreaField
            label="Learner activities"
            value={form.learnerActivities}
            disabled={!canEdit}
            onChange={(e) => updateField('learnerActivities', e.target.value)}
          />
          <TextAreaField
            label="Teaching / learning materials"
            value={form.materials}
            disabled={!canEdit}
            onChange={(e) => updateField('materials', e.target.value)}
          />
          <TextAreaField
            label="Assessment"
            value={form.assessment}
            disabled={!canEdit}
            onChange={(e) => updateField('assessment', e.target.value)}
          />
          <TextAreaField
            label="Conclusion"
            value={form.conclusion}
            disabled={!canEdit}
            onChange={(e) => updateField('conclusion', e.target.value)}
          />
          <TextAreaField
            label="Reflection / remarks"
            value={form.reflection}
            disabled={!canEdit}
            onChange={(e) => updateField('reflection', e.target.value)}
          />
        </div>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this lesson plan?"
        description="This will permanently delete the lesson plan."
        isLoading={deleteLesson.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
