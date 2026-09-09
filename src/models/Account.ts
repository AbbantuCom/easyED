import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { ACCOUNT_TYPES } from '@/lib/constants';

const accountSchema = new Schema(
  {
    _id: { type: String, required: true },
    type: { type: String, required: true, enum: ACCOUNT_TYPES },
    name: { type: String, required: true },
  },
  { strict: true, timestamps: true, _id: false },
);

export type AccountDoc = InferSchemaType<typeof accountSchema> & { _id: string };

export default mongoose.models.Account || mongoose.model('Account', accountSchema);
