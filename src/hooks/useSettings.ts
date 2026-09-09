import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { ChangePasswordInput, UpdateDisplayNameInput } from '@/validators/authValidators';
import type { UpdateAccountNameInput } from '@/validators/accountValidators';
import type { Account, User } from '@/types';

export function useUpdateDisplayName() {
  return useMutation({
    mutationFn: (input: UpdateDisplayNameInput) =>
      apiFetch<{ user: User }>('/api/auth/me', { method: 'PATCH', body: input }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      apiFetch('/api/auth/change-password', { method: 'POST', body: input }),
  });
}

export function useUpdateAccountName() {
  return useMutation({
    mutationFn: (input: UpdateAccountNameInput) =>
      apiFetch<{ account: Account }>('/api/account', { method: 'PATCH', body: input }),
  });
}
