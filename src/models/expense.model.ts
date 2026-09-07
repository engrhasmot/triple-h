import mongoose, { Schema, Document, Model } from 'mongoose';

export type ExpenseCategory =
  | 'site-visit'
  | 'rajuk-municipal'
  | 'printing-plotting'
  | 'staff-salary'
  | 'office-utility'
  | 'equipment-software'
  | 'marketing'
  | 'other';

export interface IExpense extends Document {
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  paidTo?: string;
  paymentMethod: 'cash' | 'bkash' | 'bank' | 'nagad' | 'other';
  notes?: string;
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
      enum: [
        'site-visit',
        'rajuk-municipal',
        'printing-plotting',
        'staff-salary',
        'office-utility',
        'equipment-software',
        'marketing',
        'other',
      ],
      default: 'other',
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
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bkash', 'bank', 'nagad', 'other'],
      default: 'cash',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    projectRef: {
      type: String,
      trim: true,
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

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
