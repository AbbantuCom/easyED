import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const schemeSchema = new Schema(
  {
    _id: { type: String, required: true },
    accountId: { type: String, required: true, index: true },
    creatorUserId: { type: String, required: true },
    klass: { type: String, required: true },
    subject: { type: String, required: true },
    term: { type: String, required: true },
    year: { type: Number, required: true },
  },
  { strict: true, timestamps: true, _id: false },
);

export type SchemeDoc = InferSchemaType<typeof schemeSchema> & { _id: string };

export default mongoose.models.Scheme || mongoose.model('Scheme', schemeSchema);
