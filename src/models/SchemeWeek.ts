import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const schemeWeekSchema = new Schema(
  {
    _id: { type: String, required: true },
    schemeId: { type: String, required: true, index: true },
    week: { type: Number, required: true },
    theme: { type: String, required: false, default: '' },
    topic: { type: String, required: false, default: '' },
    competency: { type: String, required: false, default: '' },
    teacherActivities: { type: String, required: false, default: '' },
    learnerActivities: { type: String, required: false, default: '' },
    materials: { type: String, required: false, default: '' },
    assessment: { type: String, required: false, default: '' },
    remarks: { type: String, required: false, default: '' },
  },
  { strict: true, timestamps: true, _id: false },
);

export type SchemeWeekDoc = InferSchemaType<typeof schemeWeekSchema> & { _id: string };

export default mongoose.models.SchemeWeek || mongoose.model('SchemeWeek', schemeWeekSchema);
