'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDeleteLesson, useLesson } from '@/hooks/useLessons';
import { useHasPermission } from '@/features/auth/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SkeletonList } from '@/components/ui/Skeleton';
import { LESSON_DETAIL_TEXT_FIELDS } from '@/features/lesson-plan/lessonFields';

export function LessonDetailPage({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const canEdit = useHasPermission('lesson.edit');
  const canDelete = useHasPermission('lesson.delete');
  const { data, isLoading, isError } = useLesson(lessonId);
  const deleteLesson = useDeleteLesson();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <SkeletonList rows={4} />;
  if (isError || !data) return <p className="text-sm text-red-600">Could not load this lesson.</p>;

  const lesson = data.lesson;

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

  const infoFields: { label: string; value: string }[] = [
    { label: 'Date', value: new Date(lesson.date).toLocaleDateString() },
    { label: 'Class', value: lesson.klass },
    { label: 'Subject', value: lesson.subject },
    { label: 'Theme', value: lesson.theme },
    { label: 'Topic', value: lesson.topic },
    { label: 'Duration', value: lesson.duration },
    { label: 'Number of learners', value: String(lesson.numLearners) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/lessons" className="text-sm font-medium text-slate-500 hover:text-slate-700">
            &larr; Back to lessons
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{lesson.topic}</h1>
        </div>
        <div className="flex gap-3">
          {canDelete && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )}
          {canEdit && (
            <Link href={`/lessons/${lessonId}/edit`}>
              <Button>Edit</Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="max-w-lg p-6">
        <h2 className="text-base font-semibold text-slate-900">Lesson information</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {infoFields.map((field) => (
            <div key={field.label}>
              <dt className="text-sm font-medium text-slate-700">{field.label}</dt>
              <dd className="mt-1 text-sm text-slate-600">
                {field.value || <span className="text-slate-400">Not set</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="max-w-lg p-6">
        <h2 className="text-base font-semibold text-slate-900">Lesson plan details</h2>
        <dl className="mt-4 flex flex-col gap-4">
          {LESSON_DETAIL_TEXT_FIELDS.map((field) => (
            <div key={field.key}>
              <dt className="text-sm font-medium text-slate-700">{field.label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                {lesson[field.key] || <span className="text-slate-400">Not set</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

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
