import mongoose, { Schema, Document, Model } from 'mongoose';

export type CastingQCStatus = 'pending-7day' | 'pending-28day' | 'passed' | 'failed';

export interface ICastingQC extends Document {
  projectName: string;
  castingDate: Date;
  floor?: string;
  location?: string;
  mixRatio?: string;
  cementBrand?: string;
  waterCementRatio?: number;
  vibratorUsed: boolean;
  coverBlockUsed: boolean;
  preCastingChecklistOk: boolean;
  cylinder7DayPsi?: number;
  cylinder28DayPsi?: number;
  testDate7Day?: Date;
  testDate28Day?: Date;
  designStrengthPsi: number;
  status: CastingQCStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CastingQCSchema = new Schema<ICastingQC>(
  {
    projectName: { type: String, required: [true, 'Project name is required'], trim: true },
    castingDate: { type: Date, required: [true, 'Casting date is required'], index: true },
    floor: { type: String, trim: true },
    location: { type: String, trim: true },
    mixRatio: { type: String, trim: true },
    cementBrand: { type: String, trim: true },
    waterCementRatio: { type: Number },
    vibratorUsed: { type: Boolean, default: true },
    coverBlockUsed: { type: Boolean, default: true },
    preCastingChecklistOk: { type: Boolean, default: false },
    cylinder7DayPsi: { type: Number },
    cylinder28DayPsi: { type: Number },
    testDate7Day: { type: Date },
    testDate28Day: { type: Date },
    designStrengthPsi: { type: Number, default: 3000 },
    status: {
      type: String,
      enum: ['pending-7day', 'pending-28day', 'passed', 'failed'],
      default: 'pending-7day',
      index: true,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

CastingQCSchema.pre('save', function (next) {
  if (this.cylinder28DayPsi != null) {
    this.status = this.cylinder28DayPsi >= this.designStrengthPsi ? 'passed' : 'failed';
  } else if (this.cylinder7DayPsi != null) {
    this.status = 'pending-28day';
  } else {
    this.status = 'pending-7day';
  }
  next();
});

CastingQCSchema.index({ castingDate: -1, status: 1 });

const CastingQC: Model<ICastingQC> =
  mongoose.models.CastingQC || mongoose.model<ICastingQC>('CastingQC', CastingQCSchema);

export default CastingQC;
