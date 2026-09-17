import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClientUser extends Document {
  name: string;
  phone: string;
  email?: string;
  password: string;
  address?: string;
  avatar?: string;
  linkedFiles: string[];
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClientUserSchema = new Schema<IClientUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    linkedFiles: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ClientUser: Model<IClientUser> =
  mongoose.models.ClientUser || mongoose.model<IClientUser>("ClientUser", ClientUserSchema);

export default ClientUser;
