import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAgreement extends Document {
  agreementNumber: string;
  clientName: string;
  clientFatherOrHusband?: string;
  clientPhone: string;
  clientAddress?: string;
  clientNid?: string;
  projectTitle: string;
  projectLocation: string;
  landArea?: string;
  floors?: string;
  scopeOfWork: string[];
  totalFee: number;
  advanceFee: number;
  dueFee: number;
  installments: Array<{
    stage: string;
    amount: number;
    dueDate?: string;
  }>;
  terms: string[];
  layoutMode: "pad" | "stamp300";
  status: "draft" | "signed" | "completed" | "cancelled";
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgreementSchema = new Schema<IAgreement>(
  {
    agreementNumber: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, required: true, trim: true },
    clientFatherOrHusband: { type: String, trim: true },
    clientPhone: { type: String, required: true, trim: true },
    clientAddress: { type: String, trim: true },
    clientNid: { type: String, trim: true },
    projectTitle: { type: String, required: true, trim: true },
    projectLocation: { type: String, required: true, trim: true },
    landArea: { type: String, trim: true },
    floors: { type: String, trim: true },
    scopeOfWork: [{ type: String }],
    totalFee: { type: Number, required: true, min: 0 },
    advanceFee: { type: Number, default: 0, min: 0 },
    dueFee: { type: Number, default: 0, min: 0 },
    installments: [
      {
        stage: { type: String, required: true },
        amount: { type: Number, required: true },
        dueDate: { type: String },
      },
    ],
    terms: [{ type: String }],
    layoutMode: { type: String, enum: ["pad", "stamp300"], default: "pad" },
    status: {
      type: String,
      enum: ["draft", "signed", "completed", "cancelled"],
      default: "draft",
    },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

const Agreement: Model<IAgreement> =
  mongoose.models.Agreement || mongoose.model<IAgreement>("Agreement", AgreementSchema);

export default Agreement;
