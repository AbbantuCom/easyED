import { z } from 'zod';

export const acceptInviteSchema = z.object({
  displayName: z.string().trim().min(1, 'Name is required').max(120),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  otp: z
    .string()
    .trim()
    .length(6, 'Enter the 6-digit code')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
