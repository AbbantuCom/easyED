'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLessons } from '@/hooks/useLessons';
import { useHasPermission } from '@/features/auth/AuthProvider';
import { CreateLessonDialog } from '@/features/lesson-plan/CreateLessonDialog';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function LessonsPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = useHasPermission('lesson.create');
  const lessons = useLessons(page, 20);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Lesson plans</h1>
        {canCreate && <Button onClick={() => setShowCreate(true)}>New lesson plan</Button>}
      </div>

      {lessons.isLoading && <SkeletonList rows={4} />}
      {lessons.isError && <p className="text-sm text-red-600">Could not load lesson plans.</p>}

      {lessons.data && lessons.data.items.length === 0 && (
        <EmptyState
          title="No lesson plans yet"
          description="Create a lesson plan from scratch, or pull details from a scheme week to get started faster."
          action={
            canCreate ? (
              <Button onClick={() => setShowCreate(true)}>Create a lesson plan</Button>
            ) : undefined
          }
        />
      )}

      {lessons.data && lessons.data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.data.items.map((lesson) => (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <p className="font-semibold text-slate-900">{lesson.topic}</p>
                <p className="text-sm text-slate-600">
                  {lesson.klass} &middot; {lesson.subject}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(lesson.date).toLocaleDateString()}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Updated {new Date(lesson.updatedAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
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

      {showCreate && <CreateLessonDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
