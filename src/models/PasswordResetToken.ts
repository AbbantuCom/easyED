import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const passwordResetTokenSchema = new Schema(
  {
    _id: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, required: false, default: null },
  },
  { strict: true, timestamps: { createdAt: true, updatedAt: false }, _id: false },
);

export type PasswordResetTokenDoc = InferSchemaType<typeof passwordResetTokenSchema> & {
  _id: string;
};

export default mongoose.models.PasswordResetToken ||
  mongoose.model('PasswordResetToken', passwordResetTokenSchema);
