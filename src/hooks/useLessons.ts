import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { lessonQueryKeys } from '@/hooks/lessonQueryKeys';
import type { CreateLessonClientInput, UpdateLessonInput } from '@/validators/lessonValidators';
import type { Lesson, Paginated } from '@/types';

export function useLessons(page: number, limit = 20) {
  return useQuery({
    queryKey: lessonQueryKeys.list(page, limit),
    queryFn: () => apiFetch<Paginated<Lesson>>('/api/lessons', { searchParams: { page, limit } }),
  });
}

export function useLesson(id: string | undefined) {
  return useQuery({
    queryKey: lessonQueryKeys.detail(id ?? ''),
    queryFn: () => apiFetch<{ lesson: Lesson }>(`/api/lessons/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLessonClientInput) =>
      apiFetch<{ lesson: Lesson }>('/api/lessons', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKeys.all });
    },
  });
}

export function useUpdateLesson(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateLessonInput) =>
      apiFetch<{ lesson: Lesson }>(`/api/lessons/${id}`, { method: 'PATCH', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKeys.all });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/lessons/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonQueryKeys.all });
    },
  });
}
