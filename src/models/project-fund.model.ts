import mongoose, { Schema, Document, Model } from 'mongoose';

export type FundSourceType = 
  | 'client-payment' 
  | 'owner-equity' 
  | 'bank-deposit' 
  | 'cash-advance' 
  | 'loan-borrowing' 
  | 'other';

export interface IProjectFund extends Document {
  title: string;
  amount: number;
  date: Date;
  source: FundSourceType;
  depositedBy: string;
  paymentMethod: 'cash' | 'bank' | 'bkash' | 'nagad' | 'cheque' | 'other';
  referenceNo?: string;
  attachmentUrl?: string;
  notes?: string;
  projectId?: mongoose.Types.ObjectId;
  projectName?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFundSchema = new Schema<IProjectFund>(
  {
    title: {
      type: String,
      required: [true, 'Fund deposit title/description is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: [true, 'Deposit date is required'],
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      enum: ['client-payment', 'owner-equity', 'bank-deposit', 'cash-advance', 'loan-borrowing', 'other'],
      default: 'owner-equity',
      index: true,
    },
    depositedBy: {
      type: String,
      required: [true, 'Deposited by name is required'],
      trim: true,
      default: 'Owner / Management',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank', 'bkash', 'nagad', 'cheque', 'other'],
      default: 'bank',
    },
    referenceNo: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    attachmentUrl: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1500, 'Notes cannot exceed 1500 characters'],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    projectName: {
      type: String,
      trim: true,
      default: 'General / Office Overhead',
      index: true,
    },
    createdBy: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

ProjectFundSchema.index({ date: -1 });
ProjectFundSchema.index({ projectId: 1, date: -1 });

const ProjectFund: Model<IProjectFund> =
  mongoose.models.ProjectFund || mongoose.model<IProjectFund>('ProjectFund', ProjectFundSchema);

export default ProjectFund;
