'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/FormField';
import { SchemeWeekPicker } from '@/features/lesson-plan/SchemeWeekPicker';
import { useCreateLesson } from '@/hooks/useLessons';
import { useToast } from '@/components/providers/ToastProvider';
import { ApiError } from '@/lib/api-client';
import type { FieldErrors } from '@/types';
import type { SchemeWeekOption } from '@/services/schemeService';

export function CreateLessonDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const createLesson = useCreateLesson();

  const [selectedWeek, setSelectedWeek] = useState<SchemeWeekOption | null>(null);
  const [date, setDate] = useState('');
  const [klass, setKlass] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [numLearners, setNumLearners] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSelectWeek(option: SchemeWeekOption) {
    setSelectedWeek(option);
    setKlass(option.klass);
    setSubject(option.subject);
    setTopic(option.topic);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    createLesson.mutate(
      {
        date,
        klass,
        subject,
        topic,
        duration,
        numLearners: Number(numLearners),
        theme: selectedWeek?.theme ?? '',
        competency: selectedWeek?.competency ?? '',
        schemeId: selectedWeek?.schemeId ?? null,
        schemeWeekId: selectedWeek?.weekId ?? null,
      },
      {
        onSuccess: ({ lesson }) => {
          showToast('Lesson plan created', 'success');
          router.push(`/lessons/${lesson.id}`);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) {
            setFieldErrors(error.fieldErrors);
          } else {
            showToast(error instanceof ApiError ? error.message : 'Could not create lesson', 'error');
          }
        },
      },
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-lesson-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 id="create-lesson-title" className="text-base font-semibold text-slate-900">
          New lesson plan
        </h2>

        <div className="mt-4">
          <SchemeWeekPicker onSelect={handleSelectWeek} />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
          <TextInput
            label="Date"
            type="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={fieldErrors.date}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
          <TextInput
            label="Topic"
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            error={fieldErrors.topic}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Duration"
              name="duration"
              placeholder="e.g. 40 minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              error={fieldErrors.duration}
              required
            />
            <TextInput
              label="Number of learners"
              type="number"
              name="numLearners"
              value={numLearners}
              onChange={(e) => setNumLearners(e.target.value)}
              error={fieldErrors.numLearners}
              required
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createLesson.isPending}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
