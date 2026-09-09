import { z } from 'zod';

const lessonFields = {
  date: z.string().min(1, 'Date is required'),
  klass: z.string().trim().min(1, 'Class is required').max(60),
  subject: z.string().trim().min(1, 'Subject is required').max(60),
  theme: z.string().trim().max(200).default(''),
  topic: z.string().trim().min(1, 'Topic is required').max(200),
  duration: z.string().trim().min(1, 'Duration is required').max(60),
  numLearners: z.coerce.number().int().min(0),
  competency: z.string().trim().max(2000).default(''),
  introduction: z.string().trim().max(4000).default(''),
  teacherActivities: z.string().trim().max(4000).default(''),
  learnerActivities: z.string().trim().max(4000).default(''),
  materials: z.string().trim().max(2000).default(''),
  assessment: z.string().trim().max(2000).default(''),
  conclusion: z.string().trim().max(4000).default(''),
  reflection: z.string().trim().max(4000).default(''),
  schemeId: z.string().nullable().optional(),
  schemeWeekId: z.string().nullable().optional(),
};

export const createLessonSchema = z.object(lessonFields);

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
/** Pre-default shape accepted from the client, where empty-string-defaulted fields are optional. */
export type CreateLessonClientInput = z.input<typeof createLessonSchema>;

export const updateLessonSchema = z.object(lessonFields).partial();

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
/** Pre-default shape accepted from the client. */
export type UpdateLessonClientInput = z.input<typeof updateLessonSchema>;
