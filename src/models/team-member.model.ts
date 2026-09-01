import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMember extends Document {
  name: string;
  designation: string;
  bio: string;
  image?: { url: string; publicId: string };
  email?: string;
  phone?: string;
  expertise: string[];
  socialLinks: { platform: string; url: string }[];
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    bio: { type: String, required: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    email: { type: String },
    phone: { type: String },
    expertise: [{ type: String }],
    socialLinks: [
      {
        platform: { type: String },
        url: { type: String },
      },
    ],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.TeamMember ||
  mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);
