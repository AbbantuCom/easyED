import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const inviteTokenSchema = new Schema(
  {
    _id: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    accountId: { type: String, required: true, index: true },
    otpHash: { type: String, required: false, default: null },
    otpExpiresAt: { type: Date, required: false, default: null },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, required: false, default: null },
  },
  { strict: true, timestamps: { createdAt: true, updatedAt: false }, _id: false },
);

export type InviteTokenDoc = InferSchemaType<typeof inviteTokenSchema> & { _id: string };

export default mongoose.models.InviteToken || mongoose.model('InviteToken', inviteTokenSchema);
