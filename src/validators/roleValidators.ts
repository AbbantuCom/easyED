import { z } from 'zod';
import { PERMISSIONS } from '@/lib/constants';

export const createRoleSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required').max(60),
  permissions: z.array(z.enum(PERMISSIONS)).default([]),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required').max(60).optional(),
  permissions: z.array(z.enum(PERMISSIONS)).optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
