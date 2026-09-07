import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChecklistItem {
  item: string;
  status: "pass" | "issue" | "na";
  note?: string;
}

export interface IInspection extends Document {
  reportNumber: string;
  clientName: string;
  clientPhone: string;
  projectTitle: string;
  projectLocation: string;
  inspectionDate: Date;
  stage: string;
  inspectorName: string;
  checklist: IChecklistItem[];
  observations: string;
  instructions: string;
  photos: string[];
  status: "satisfactory" | "action-required" | "rejected";
  nextVisitDate?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionSchema = new Schema<IInspection>(
  {
    reportNumber: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, required: true, trim: true },
    projectTitle: { type: String, required: true, trim: true },
    projectLocation: { type: String, required: true, trim: true },
    inspectionDate: { type: Date, default: Date.now },
    stage: { type: String, required: true },
    inspectorName: { type: String, default: "ইঞ্জিনিয়ার মোঃ হাসমত আলী" },
    checklist: [
      {
        item: { type: String, required: true },
        status: { type: String, enum: ["pass", "issue", "na"], default: "pass" },
        note: { type: String },
      },
    ],
    observations: { type: String, required: true },
    instructions: { type: String, required: true },
    photos: [{ type: String }],
    status: {
      type: String,
      enum: ["satisfactory", "action-required", "rejected"],
      default: "satisfactory",
    },
    nextVisitDate: { type: String },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

const Inspection: Model<IInspection> =
  mongoose.models.Inspection || mongoose.model<IInspection>("Inspection", InspectionSchema);

export default Inspection;
