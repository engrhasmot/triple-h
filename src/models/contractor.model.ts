import mongoose, { Schema, Document, Model } from 'mongoose';

export type ContractorSpecialty =
  | 'mason'
  | 'rod-binder'
  | 'shuttering'
  | 'sanitary-plumber'
  | 'electrician'
  | 'painter'
  | 'tile-fixer'
  | 'earthwork'
  | 'other';

export interface IContractor extends Document {
  name: string;
  phone: string;
  specialty: ContractorSpecialty;
  experienceYears?: number;
  rating: number;
  area?: string;
  notes?: string;
  lastWorked?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContractorSchema = new Schema<IContractor>(
  {
    name: {
      type: String,
      required: [true, 'Contractor name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      enum: [
        'mason',
        'rod-binder',
        'shuttering',
        'sanitary-plumber',
        'electrician',
        'painter',
        'tile-fixer',
        'earthwork',
        'other',
      ],
      index: true,
    },
    experienceYears: {
      type: Number,
      min: [0, 'Experience years cannot be negative'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 3,
    },
    area: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    lastWorked: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ContractorSchema.index({ rating: -1 });
ContractorSchema.index({ isActive: 1, specialty: 1 });

const Contractor: Model<IContractor> =
  mongoose.models.Contractor || mongoose.model<IContractor>('Contractor', ContractorSchema);

export default Contractor;
