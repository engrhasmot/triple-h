import mongoose, { Schema, Document, Model } from 'mongoose';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'bkash' | 'nagad' | 'bank' | 'rocket';

export interface IPaymentSubmission extends Document {
  clientName: string;
  phone: string;
  planFileRef?: string;
  projectTitle?: string;
  amount: number;
  method: PaymentMethod;
  senderPhone: string;
  transactionId: string;
  note?: string;
  screenshotUrl?: string;
  status: SubmissionStatus;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSubmissionSchema = new Schema<IPaymentSubmission>(
  {
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
    },
    planFileRef: {
      type: String,
      trim: true,
      uppercase: true,
    },
    projectTitle: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    method: {
      type: String,
      enum: ['bkash', 'nagad', 'bank', 'rocket'],
      default: 'bkash',
      required: true,
    },
    senderPhone: {
      type: String,
      required: [true, 'Sender phone number is required'],
      trim: true,
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID (TrxID) is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    note: {
      type: String,
      trim: true,
    },
    screenshotUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSubmissionSchema.index({ createdAt: -1, status: 1 });

const PaymentSubmission: Model<IPaymentSubmission> =
  mongoose.models.PaymentSubmission ||
  mongoose.model<IPaymentSubmission>('PaymentSubmission', PaymentSubmissionSchema);

export default PaymentSubmission;
