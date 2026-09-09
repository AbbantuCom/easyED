import { z } from 'zod';

export const updateAccountNameSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
});

export type UpdateAccountNameInput = z.infer<typeof updateAccountNameSchema>;
