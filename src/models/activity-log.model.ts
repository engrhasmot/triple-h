import mongoose, { Model, Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  action: string;
  resource: string;
  resourceId?: string;
  performedBy: string;
  details?: string;
  ip?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    performedBy: { type: String, required: true, index: true },
    details: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
