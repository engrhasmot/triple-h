import mongoose, { Schema, Document, Model } from 'mongoose';

export type WorkerRole = 'mason' | 'helper' | 'rod-binder' | 'shuttering' | 'painter' | 'plumber' | 'electrician' | 'other';

export interface IWorker {
  name: string;
  role: WorkerRole;
  present: boolean;
  dailyWage: number;
}

export interface ISiteHazira extends Document {
  projectName: string;
  date: Date;
  workers: IWorker[];
  totalWage: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema = new Schema<IWorker>(
  {
    name: { type: String, required: [true, 'Worker name is required'], trim: true },
    role: {
      type: String,
      required: [true, 'Worker role is required'],
      enum: ['mason', 'helper', 'rod-binder', 'shuttering', 'painter', 'plumber', 'electrician', 'other'],
    },
    present: { type: Boolean, default: true },
    dailyWage: { type: Number, default: 0, min: [0, 'Daily wage cannot be negative'] },
  },
  { _id: true }
);

const SiteHaziraSchema = new Schema<ISiteHazira>(
  {
    projectName: { type: String, required: [true, 'Project name is required'], trim: true, index: true },
    date: { type: Date, required: [true, 'Date is required'], default: () => new Date(), index: true },
    workers: { type: [WorkerSchema], default: [] },
    totalWage: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

SiteHaziraSchema.pre('save', function (next) {
  this.totalWage = (this.workers || []).reduce((sum, worker) => {
    return sum + (worker.present ? (worker.dailyWage || 0) : 0);
  }, 0);
  next();
});

SiteHaziraSchema.index({ date: -1, projectName: 1 });

const SiteHazira: Model<ISiteHazira> =
  mongoose.models.SiteHazira || mongoose.model<ISiteHazira>('SiteHazira', SiteHaziraSchema);

export default SiteHazira;
