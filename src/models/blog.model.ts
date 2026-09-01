import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  coverImage?: { url: string; publicId: string };
  tags: string[];
  category: string;
  publishedAt?: Date;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: {
      url: { type: String },
      publicId: { type: String },
    },
    tags: [{ type: String }],
    category: { type: String, required: true },
    publishedAt: { type: Date },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
