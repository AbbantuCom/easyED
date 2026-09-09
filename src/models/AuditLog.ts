import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const auditLogSchema = new Schema(
  {
    _id: { type: String, required: true },
    accountId: { type: String, required: true, index: true },
    actorUserId: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  { strict: true, timestamps: { createdAt: true, updatedAt: false }, _id: false },
);

export type AuditLogDoc = InferSchemaType<typeof auditLogSchema> & { _id: string };

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
