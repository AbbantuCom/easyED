import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { roleQueryKeys, staffQueryKeys } from '@/hooks/staffQueryKeys';
import type { CreateRoleInput, UpdateRoleInput } from '@/validators/roleValidators';
import type { InviteUserInput } from '@/validators/userValidators';
import type { Role, User } from '@/types';

export function useStaff() {
  return useQuery({
    queryKey: staffQueryKeys.all,
    queryFn: () => apiFetch<{ staff: User[] }>('/api/users'),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: roleQueryKeys.all,
    queryFn: () => apiFetch<{ roles: Role[] }>('/api/roles'),
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteUserInput) =>
      apiFetch('/api/users/invite', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });
    },
  });
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      apiFetch<{ user: User }>(`/api/users/${userId}`, { method: 'PATCH', body: { roleId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });
    },
  });
}

export function useRemoveStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiFetch(`/api/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.all });
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) =>
      apiFetch<{ role: Role }>('/api/roles', { method: 'POST', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      apiFetch<{ role: Role }>(`/api/roles/${id}`, { method: 'PATCH', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
    },
  });
}
