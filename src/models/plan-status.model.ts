import mongoose, { Schema, Document, Model } from 'mongoose';

export type PlanStatusType =
  | 'submitted'
  | 'under-review'
  | 'revision-required'
  | 'approved'
  | 'rejected';

export interface IStatusHistoryEntry {
  status: PlanStatusType;
  note: string;
  updatedBy: string;
  date: Date;
}

export interface IPlanDocument {
  name: string;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface IPlanStatus extends Document {
  fileId: string;
  clientName: string;
  phone: string;
  projectTitle: string;
  location: string;
  currentStatus: PlanStatusType;
  statusHistory: IStatusHistoryEntry[];
  documents: IPlanDocument[];
  submissionDate: Date;
  expectedCompletionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: {
      type: String,
      required: true,
      enum: ['submitted', 'under-review', 'revision-required', 'approved', 'rejected'],
    },
    note: { type: String, default: '' },
    updatedBy: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PlanDocumentSchema = new Schema<IPlanDocument>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PlanStatusSchema = new Schema<IPlanStatus>(
  {
    fileId: {
      type: String,
      required: [true, 'File ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
      validate: {
        validator: (v: string) => /^(?:\+?880)?\d{10,11}$/.test(v.replace(/[\s-]/g, '')),
        message: 'Please provide a valid Bangladeshi phone number',
      },
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    currentStatus: {
      type: String,
      enum: ['submitted', 'under-review', 'revision-required', 'approved', 'rejected'],
      default: 'submitted',
      index: true,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
    documents: {
      type: [PlanDocumentSchema],
      default: [],
    },
    submissionDate: {
      type: Date,
      required: [true, 'Submission date is required'],
      default: Date.now,
    },
    expectedCompletionDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Auto-generate fileId if not provided
PlanStatusSchema.pre('validate', async function (next) {
  if (!this.fileId) {
    const year = new Date().getFullYear();
    const last = (await mongoose.models.PlanStatus.findOne({
      fileId: new RegExp(`^TH-${year}-`),
    })
      .sort({ fileId: -1 })
      .select('fileId')
      .lean()) as { fileId: string } | null;
    let nextNum = 1;
    if (last) {
      const match = last.fileId.match(/-(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    this.fileId = `TH-${year}-${String(nextNum).padStart(4, '0')}`;
  }
  next();
});

// Auto-add to statusHistory when currentStatus changes.
// On creation the caller already seeds the initial history entry,
// so only push for updates to avoid duplicate entries.
PlanStatusSchema.pre('save', function (next) {
  if (this.isNew) {
    if (!this.statusHistory || this.statusHistory.length === 0) {
      this.statusHistory.push({
        status: this.currentStatus,
        note: '',
        updatedBy: 'system',
        date: new Date(),
      });
    }
  } else if (this.isModified('currentStatus')) {
    this.statusHistory.push({
      status: this.currentStatus,
      note: '',
      updatedBy: 'system',
      date: new Date(),
    });
  }
  next();
});

const PlanStatus: Model<IPlanStatus> =
  mongoose.models.PlanStatus ||
  mongoose.model<IPlanStatus>('PlanStatus', PlanStatusSchema);

export default PlanStatus;
