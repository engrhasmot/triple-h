import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  clientName: string;
  designation?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: { url: string; publicId: string };
  projectImage?: { url: string; publicId: string };
  isFeatured: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    clientName: { type: String, required: true },
    designation: { type: String },
    company: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },
    projectImage: {
      url: { type: String },
      publicId: { type: String },
    },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
