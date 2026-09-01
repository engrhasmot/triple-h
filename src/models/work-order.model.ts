import mongoose, { Schema, Document, Model } from 'mongoose';

export type WorkOrderStatus = 'pending' | 'reviewed' | 'approved' | 'in-progress' | 'completed' | 'cancelled';

export interface IWorkOrder extends Document {
  name: string;
  phone: string;
  email?: string;
  projectTitle: string;
  projectLocation: string;
  requirements: string;
  estimatedBudget?: string;
  status: WorkOrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    projectLocation: {
      type: String,
      required: [true, 'Project location is required'],
      trim: true,
    },
    requirements: {
      type: String,
      required: [true, 'Project requirements are required'],
      maxlength: [5000, 'Requirements cannot exceed 5000 characters'],
    },
    estimatedBudget: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    notes: { type: String, maxlength: [5000, 'Notes cannot exceed 5000 characters'] },
  },
  {
    timestamps: true,
  }
);

const WorkOrder: Model<IWorkOrder> =
  mongoose.models.WorkOrder || mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);

export default WorkOrder;
