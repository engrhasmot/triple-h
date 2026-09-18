import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  order: number;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectCategorySchema = new Schema<IProjectCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ProjectCategorySchema.pre('validate', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

const ProjectCategory: Model<IProjectCategory> =
  mongoose.models.ProjectCategory ||
  mongoose.model<IProjectCategory>('ProjectCategory', ProjectCategorySchema);

export default ProjectCategory;
