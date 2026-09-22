import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentMethodType = 'cash' | 'bkash' | 'bank' | 'nagad' | 'cheque' | 'other';

export interface IExpense extends Document {
  title: string;
  category: string;
  subCategory?: string;
  amount: number;
  date: Date;
  paidTo?: string;
  paymentMethod: PaymentMethodType;
  voucherNo?: string;
  attachmentUrl?: string;
  notes?: string;
  projectId?: mongoose.Types.ObjectId;
  projectName?: string;
  projectRef?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'other',
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
      index: true,
    },
    paidTo: {
      type: String,
      trim: true,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bkash', 'bank', 'nagad', 'cheque', 'other'],
      default: 'cash',
    },
    voucherNo: {
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
      default: '',
      index: true,
    },
    projectRef: {
      type: String,
      trim: true,
      default: '',
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

ExpenseSchema.index({ date: -1, category: 1 });
ExpenseSchema.index({ projectId: 1, date: -1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
