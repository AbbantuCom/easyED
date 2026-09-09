import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

export const registerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('individual'),
    name: z.string().trim().min(1, 'Name is required').max(120),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    password: passwordSchema,
  }),
  z.object({
    type: z.literal('school'),
    schoolName: z.string().trim().min(1, 'School name is required').max(120),
    displayName: z.string().trim().min(1, 'Your name is required').max(120),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    password: passwordSchema,
  }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateDisplayNameSchema = z.object({
  displayName: z.string().trim().min(1, 'Name is required').max(120),
});

export type UpdateDisplayNameInput = z.infer<typeof updateDisplayNameSchema>;
