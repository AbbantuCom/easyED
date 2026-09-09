import { z } from 'zod';

export const inviteUserSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  roleId: z.string().min(1, 'Role is required'),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const updateUserRoleSchema = z.object({
  roleId: z.string().min(1, 'Role is required'),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
