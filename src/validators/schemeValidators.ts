import { z } from 'zod';

export const createSchemeSchema = z.object({
  klass: z.string().trim().min(1, 'Class is required').max(60),
  subject: z.string().trim().min(1, 'Subject is required').max(60),
  term: z.string().trim().min(1, 'Term is required').max(60),
  year: z.coerce.number().int().min(2000).max(2100),
});

export type CreateSchemeInput = z.infer<typeof createSchemeSchema>;

export const updateSchemeSchema = createSchemeSchema.partial();

export type UpdateSchemeInput = z.infer<typeof updateSchemeSchema>;

const weekFields = {
  week: z.coerce.number().int().min(1, 'Week number is required'),
  theme: z.string().trim().max(200).default(''),
  topic: z.string().trim().max(200).default(''),
  competency: z.string().trim().max(2000).default(''),
  teacherActivities: z.string().trim().max(4000).default(''),
  learnerActivities: z.string().trim().max(4000).default(''),
  materials: z.string().trim().max(2000).default(''),
  assessment: z.string().trim().max(2000).default(''),
  remarks: z.string().trim().max(2000).default(''),
};

export const createSchemeWeekSchema = z.object(weekFields);

export type CreateSchemeWeekInput = z.infer<typeof createSchemeWeekSchema>;

export const updateSchemeWeekSchema = z.object(weekFields).partial();

export type UpdateSchemeWeekInput = z.infer<typeof updateSchemeWeekSchema>;
