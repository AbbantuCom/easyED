import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const lessonSchema = new Schema(
  {
    _id: { type: String, required: true },
    accountId: { type: String, required: true, index: true },
    creatorUserId: { type: String, required: true },
    schemeId: { type: String, required: false, default: null },
    schemeWeekId: { type: String, required: false, default: null },
    date: { type: Date, required: true },
    klass: { type: String, required: true },
    subject: { type: String, required: true },
    theme: { type: String, required: false, default: '' },
    topic: { type: String, required: true },
    duration: { type: String, required: true },
    numLearners: { type: Number, required: true },
    competency: { type: String, required: false, default: '' },
    introduction: { type: String, required: false, default: '' },
    teacherActivities: { type: String, required: false, default: '' },
    learnerActivities: { type: String, required: false, default: '' },
    materials: { type: String, required: false, default: '' },
    assessment: { type: String, required: false, default: '' },
    conclusion: { type: String, required: false, default: '' },
    reflection: { type: String, required: false, default: '' },
  },
  { strict: true, timestamps: true, _id: false },
);

export type LessonDoc = InferSchemaType<typeof lessonSchema> & { _id: string };

export default mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
