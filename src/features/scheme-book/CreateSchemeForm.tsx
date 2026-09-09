'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextInput } from '@/components/ui/FormField';
import { useCreateScheme } from '@/hooks/useSchemes';
import { useToast } from '@/components/providers/ToastProvider';
import { ApiError } from '@/lib/api-client';
import type { FieldErrors } from '@/types';

export function CreateSchemeForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const createScheme = useCreateScheme();

  const [klass, setKlass] = useState('');
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    createScheme.mutate(
      { klass, subject, term, year: Number(year) },
      {
        onSuccess: ({ scheme }) => {
          showToast('Scheme book created', 'success');
          router.push(`/schemes/${scheme.id}`);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) {
            setFieldErrors(error.fieldErrors);
          } else {
            showToast(error instanceof ApiError ? error.message : 'Could not create scheme', 'error');
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">New scheme book</h1>

      <Card className="max-w-md p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <TextInput
            label="Class"
            name="klass"
            value={klass}
            onChange={(e) => setKlass(e.target.value)}
            error={fieldErrors.klass}
            required
          />
          <TextInput
            label="Subject"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={fieldErrors.subject}
            required
          />
          <TextInput
            label="Term"
            name="term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            error={fieldErrors.term}
            required
          />
          <TextInput
            label="Year"
            name="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            error={fieldErrors.year}
            required
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push('/schemes')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createScheme.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
