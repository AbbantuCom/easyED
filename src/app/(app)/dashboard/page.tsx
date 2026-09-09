'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSchemes } from '@/hooks/useSchemes';
import { useLessons } from '@/hooks/useLessons';
import { Card } from '@/components/ui/Card';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  const schemes = useSchemes(1, 5);
  const lessons = useLessons(1, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.displayName}</h1>
        <p className="mt-1 text-sm text-slate-600">Here&apos;s what&apos;s recent in your account.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent scheme books</h2>
            <Link href="/schemes">
              <Button variant="secondary">New scheme</Button>
            </Link>
          </div>

          {schemes.isLoading && <SkeletonList rows={3} />}
          {schemes.isError && (
            <Card className="p-4 text-sm text-red-600">Could not load schemes.</Card>
          )}
          {schemes.data && schemes.data.items.length === 0 && (
            <EmptyState
              title="No scheme books yet"
              description="Create your first scheme book to start planning your term week by week."
              action={
                <Link href="/schemes">
                  <Button>Create a scheme book</Button>
                </Link>
              }
            />
          )}
          {schemes.data && schemes.data.items.length > 0 && (
            <div className="flex flex-col gap-3">
              {schemes.data.items.map((scheme) => (
                <Link key={scheme.id} href={`/schemes/${scheme.id}`}>
                  <Card className="p-4 transition-shadow hover:shadow-md">
                    <p className="font-medium text-slate-900">
                      {scheme.klass} &middot; {scheme.subject}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {scheme.term} {scheme.year} &middot; {scheme.weekCount ?? 0} weeks
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent lesson plans</h2>
            <Link href="/lessons">
              <Button variant="secondary">New lesson</Button>
            </Link>
          </div>

          {lessons.isLoading && <SkeletonList rows={3} />}
          {lessons.isError && (
            <Card className="p-4 text-sm text-red-600">Could not load lessons.</Card>
          )}
          {lessons.data && lessons.data.items.length === 0 && (
            <EmptyState
              title="No lesson plans yet"
              description="Create your first lesson plan, optionally pulling details from a scheme week."
              action={
                <Link href="/lessons">
                  <Button>Create a lesson plan</Button>
                </Link>
              }
            />
          )}
          {lessons.data && lessons.data.items.length > 0 && (
            <div className="flex flex-col gap-3">
              {lessons.data.items.map((lesson) => (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <Card className="p-4 transition-shadow hover:shadow-md">
                    <p className="font-medium text-slate-900">{lesson.topic}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {lesson.klass} &middot; {lesson.subject} &middot;{' '}
                      {new Date(lesson.date).toLocaleDateString()}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
