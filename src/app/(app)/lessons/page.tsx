'use client';

import { useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLessons } from '@/hooks/useLessons';
import { useHasPermission } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function LessonsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const canCreate = useHasPermission('lesson.create');
  const lessons = useLessons(page, 20);

  function goToLesson(lessonId: string) {
    router.push(`/lessons/${lessonId}`);
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, lessonId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToLesson(lessonId);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Lesson plans</h1>
        {canCreate && (
          <Link href="/lessons/new">
            <Button>New lesson plan</Button>
          </Link>
        )}
      </div>

      {lessons.isLoading && <SkeletonList rows={4} />}
      {lessons.isError && <p className="text-sm text-red-600">Could not load lesson plans.</p>}

      {lessons.data && lessons.data.items.length === 0 && (
        <EmptyState
          title="No lesson plans yet"
          description="Create a lesson plan from scratch, or pull details from a scheme week to get started faster."
          action={
            canCreate ? (
              <Link href="/lessons/new">
                <Button>Create a lesson plan</Button>
              </Link>
            ) : undefined
          }
        />
      )}

      {lessons.data && lessons.data.items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Class / Subject</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Topic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.data.items.map((lesson) => (
                <tr
                  key={lesson.id}
                  onClick={() => goToLesson(lesson.id)}
                  onKeyDown={(e) => handleRowKeyDown(e, lesson.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View lesson ${lesson.topic}`}
                  className="cursor-pointer hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {new Date(lesson.date).toLocaleDateString()}
                  </td>
                  <td className="max-w-50 truncate px-4 py-3 text-slate-700">
                    {lesson.klass} &middot; {lesson.subject}
                  </td>
                  <td className="max-w-60 truncate px-4 py-3 font-medium text-slate-900">
                    {lesson.topic}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lessons.data && lessons.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {lessons.data.page} of {lessons.data.totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.min(lessons.data!.totalPages, p + 1))}
            disabled={page >= lessons.data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
