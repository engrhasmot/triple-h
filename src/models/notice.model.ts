import mongoose, { Schema, Document, Model } from "mongoose";

export type NoticeCategory =
  | "holiday"
  | "engineering_tips"
  | "regulatory"
  | "offer"
  | "general";

export type NoticePriority = "urgent" | "important" | "normal";
export type NoticeTarget = "all" | "clients_only";

export interface INotice extends Document {
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  targetAudience: NoticeTarget;
  isPinned: boolean;
  isActive: boolean;
  publishedAt: Date;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["holiday", "engineering_tips", "regulatory", "offer", "general"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["urgent", "important", "normal"],
      default: "normal",
    },
    targetAudience: {
      type: String,
      enum: ["all", "clients_only"],
      default: "all",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    author: {
      type: String,
      default: "ইঞ্জিনিয়ার মোঃ হাসমত আলী",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

NoticeSchema.index({ isPinned: -1, publishedAt: -1 });

const Notice: Model<INotice> =
  mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);

export default Notice;
