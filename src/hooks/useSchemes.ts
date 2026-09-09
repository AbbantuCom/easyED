import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { schemeQueryKeys } from '@/hooks/schemeQueryKeys';
import type { CreateSchemeInput, CreateSchemeWeekInput, UpdateSchemeInput, UpdateSchemeWeekInput } from '@/validators/schemeValidators';
import type { Paginated, Scheme, SchemeWeek } from '@/types';
import type { SchemeWeekOption } from '@/services/schemeService';

export function useSchemes(page: number, limit = 20) {
  return useQuery({
    queryKey: schemeQueryKeys.list(page, limit),
    queryFn: () => apiFetch<Paginated<Scheme>>('/api/schemes', { searchParams: { page, limit } }),
  });
}

export function useScheme(id: string | undefined) {
  return useQuery({
    queryKey: schemeQueryKeys.detail(id ?? ''),
    queryFn: () =>
      apiFetch<{ scheme: Scheme; weeks: SchemeWeek[] }>(`/api/schemes/${id}`),
    enabled: Boolean(id),
  });
}

export function useSchemeWeekOptions() {
  return useQuery({
    queryKey: schemeQueryKeys.weekOptions,
    queryFn: () => apiFetch<{ options: SchemeWeekOption[] }>('/api/schemes/week-options'),
  });
}

export function useCreateScheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSchemeInput) =>
      apiFetch<{ scheme: Scheme }>('/api/schemes', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemeQueryKeys.all });
    },
  });
}

export function useUpdateScheme(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSchemeInput) =>
      apiFetch<{ scheme: Scheme }>(`/api/schemes/${id}`, { method: 'PATCH', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemeQueryKeys.all });
    },
  });
}

export function useDeleteScheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/schemes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemeQueryKeys.all });
    },
  });
}

export function useAddSchemeWeek(schemeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSchemeWeekInput) =>
      apiFetch<{ week: SchemeWeek }>(`/api/schemes/${schemeId}/weeks`, {
        method: 'POST',
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemeQueryKeys.detail(schemeId) });
    },
  });
}

export function useUpdateSchemeWeek(schemeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ weekId, input }: { weekId: string; input: UpdateSchemeWeekInput }) =>
      apiFetch<{ week: SchemeWeek }>(`/api/schemes/${schemeId}/weeks/${weekId}`, {
        method: 'PATCH',
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemeQueryKeys.detail(schemeId) });
    },
  });
}

export function useDeleteSchemeWeek(schemeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weekId: string) =>
      apiFetch(`/api/schemes/${schemeId}/weeks/${weekId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemeQueryKeys.detail(schemeId) });
    },
  });
}
