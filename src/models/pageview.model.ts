import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPageView extends Document {
  path: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    path: {
      type: String,
      required: [true, 'Path is required'],
      trim: true,
      index: true,
    },
    referrer: { type: String, trim: true },
    userAgent: { type: String },
    ip: { type: String, index: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Automatically expire page views after 60 days to prevent unbounded collection growth.
PageViewSchema.index({ timestamp: 1 }, { expireAfterSeconds: 5184000 });

const PageView: Model<IPageView> =
  mongoose.models.PageView || mongoose.model<IPageView>('PageView', PageViewSchema);

export default PageView;
