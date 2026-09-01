import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentStatus = 'due' | 'partial' | 'paid' | 'overdue';
export type InstallmentType = 'booking' | 'design-fee' | 'approval-fee' | 'site-visit' | 'final' | 'other';

export interface IInstallment {
  type: InstallmentType;
  label: string;
  amount: number;
  paidOn: Date;
  note?: string;
  receivedBy: string;
}

export interface IPayment extends Document {
  clientName: string;
  phone: string;
  projectTitle: string;
  serviceType: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: PaymentStatus;
  installments: IInstallment[];
  dueDate?: Date;
  planFileRef?: string; // Optional link to PlanStatus fileId
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstallmentSchema = new Schema<IInstallment>(
  {
    type: {
      type: String,
      enum: ['booking', 'design-fee', 'approval-fee', 'site-visit', 'final', 'other'],
      required: true,
    },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    paidOn: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    receivedBy: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
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
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount must be positive'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: function (this: IPayment) {
        return this.totalAmount - this.paidAmount;
      },
    },
    status: {
      type: String,
      enum: ['due', 'partial', 'paid', 'overdue'],
      default: 'due',
      index: true,
    },
    installments: {
      type: [InstallmentSchema],
      default: [],
    },
    dueDate: { type: Date },
    planFileRef: { type: String, trim: true, uppercase: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-recalculate paidAmount, dueAmount, status before saving
PaymentSchema.pre('save', function (next) {
  const totalPaid = this.installments.reduce((sum, inst) => sum + inst.amount, 0);
  this.paidAmount = totalPaid;
  this.dueAmount = Math.max(0, this.totalAmount - totalPaid);

  if (totalPaid <= 0) {
    this.status = this.dueDate && new Date() > this.dueDate ? 'overdue' : 'due';
  } else if (totalPaid >= this.totalAmount) {
    this.status = 'paid';
  } else {
    this.status = this.dueDate && new Date() > this.dueDate ? 'overdue' : 'partial';
  }

  next();
});

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
