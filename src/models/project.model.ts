import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectImage {
  url: string;
  publicId: string;
  alt: string;
  isBefore: boolean;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  category: '2d-plan' | '3d-exterior' | '3d-interior' | 'construction';
  client?: string;
  location: string;
  area?: number;
  completionDate?: Date;
  images: IProjectImage[];
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectImageSchema = new Schema<IProjectImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: '' },
    isBefore: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ['2d-plan', '3d-exterior', '3d-interior', 'construction'],
        message: '{VALUE} is not a valid category',
      },
    },
    client: { type: String, trim: true },
    location: {
      type: String,
      required: [true, 'Project location is required'],
      trim: true,
    },
    area: { type: Number, min: [0, 'Area must be positive'] },
    completionDate: { type: Date },
    images: {
      type: [ProjectImageSchema],
      validate: {
        validator: (v: IProjectImage[]) => v.length > 0,
        message: 'At least one image is required',
      },
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from title before validation
ProjectSchema.pre('validate', function (next) {
  if (this.isModified('title') && !this.isModified('slug')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
