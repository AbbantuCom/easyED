import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@/validators/authValidators';
import type { AcceptInviteInput } from '@/validators/inviteValidators';
import type { Account, User } from '@/types';
import type { Permission } from '@/lib/constants';

interface AuthResponse {
  user: User;
  account: Account;
  permissions?: Permission[];
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: input }),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: input }),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      apiFetch('/api/auth/forgot-password', { method: 'POST', body: input }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      apiFetch('/api/auth/reset-password', { method: 'POST', body: input }),
  });
}

export function useInviteeEmail(token: string) {
  return useQuery({
    queryKey: ['invite', token],
    queryFn: () => apiFetch<{ email: string }>(`/api/invites/${token}`),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useRequestInviteOtp(token: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/api/invites/${token}/request-otp`, { method: 'POST' }),
  });
}

export function useAcceptInvite(token: string) {
  return useMutation({
    mutationFn: (input: AcceptInviteInput) =>
      apiFetch<AuthResponse>(`/api/invites/${token}/accept`, { method: 'POST', body: input }),
  });
}
