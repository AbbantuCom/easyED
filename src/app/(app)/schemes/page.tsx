'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSchemes } from '@/hooks/useSchemes';
import { useHasPermission } from '@/features/auth/AuthProvider';
import { CreateSchemeDialog } from '@/features/scheme-book/CreateSchemeDialog';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SchemesPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = useHasPermission('scheme.create');
  const schemes = useSchemes(page, 20);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Scheme books</h1>
        {canCreate && <Button onClick={() => setShowCreate(true)}>New scheme book</Button>}
      </div>

      {schemes.isLoading && <SkeletonList rows={4} />}
      {schemes.isError && <p className="text-sm text-red-600">Could not load scheme books.</p>}

      {schemes.data && schemes.data.items.length === 0 && (
        <EmptyState
          title="No scheme books yet"
          description="A scheme book lays out your term week by week. Create one to get started."
          action={
            canCreate ? (
              <Button onClick={() => setShowCreate(true)}>Create a scheme book</Button>
            ) : undefined
          }
        />
      )}

      {schemes.data && schemes.data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.data.items.map((scheme) => (
            <Link key={scheme.id} href={`/schemes/${scheme.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <p className="font-semibold text-slate-900">{scheme.klass}</p>
                <p className="text-sm text-slate-600">{scheme.subject}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {scheme.term} {scheme.year} &middot; {scheme.weekCount ?? 0} weeks
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Updated {new Date(scheme.updatedAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {schemes.data && schemes.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {schemes.data.page} of {schemes.data.totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.min(schemes.data!.totalPages, p + 1))}
            disabled={page >= schemes.data.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {showCreate && <CreateSchemeDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
