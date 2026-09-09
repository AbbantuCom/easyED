import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { USER_STATUSES } from '@/lib/constants';

const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    accountId: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    roleId: { type: String, required: false, default: null },
    status: { type: String, required: true, enum: USER_STATUSES, default: 'active' },
    invitedAt: { type: Date, required: false, default: null },
    activatedAt: { type: Date, required: false, default: null },
  },
  { strict: true, timestamps: true, _id: false },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: string };

export default mongoose.models.User || mongoose.model('User', userSchema);
