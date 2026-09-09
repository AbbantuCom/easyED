import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { PERMISSIONS } from '@/lib/constants';

const roleSchema = new Schema(
  {
    _id: { type: String, required: true },
    accountId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    isSuperAdmin: { type: Boolean, required: true, default: false },
    permissions: { type: [{ type: String, enum: PERMISSIONS }], required: true, default: [] },
  },
  { strict: true, timestamps: true, _id: false },
);

export type RoleDoc = InferSchemaType<typeof roleSchema> & { _id: string };

export default mongoose.models.Role || mongoose.model('Role', roleSchema);
