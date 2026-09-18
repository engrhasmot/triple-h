import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlanDocumentFile extends Document {
  planId?: mongoose.Types.ObjectId;
  fileId?: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  data: Buffer;
  createdAt: Date;
}

const PlanDocumentFileSchema = new Schema<IPlanDocumentFile>(
  {
    planId: { type: Schema.Types.ObjectId, ref: 'PlanStatus' },
    fileId: { type: String, index: true },
    filename: { type: String, required: true },
    contentType: { type: String, default: 'application/pdf' },
    sizeBytes: { type: Number, required: true },
    data: { type: Buffer, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PlanDocumentFile: Model<IPlanDocumentFile> =
  mongoose.models.PlanDocumentFile ||
  mongoose.model<IPlanDocumentFile>('PlanDocumentFile', PlanDocumentFileSchema);

export default PlanDocumentFile;
