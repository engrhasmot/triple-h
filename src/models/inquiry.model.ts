import mongoose, { Schema, Document, Model } from 'mongoose';

export type ServiceType =
  | '2d-drafting'
  | '3d-design'
  | 'boq-estimation'
  | 'cost-estimator'
  | 'plan-passing'
  | 'site-supervision'
  | 'consultation';

export type InquirySource = 'website' | 'whatsapp' | 'phone' | 'referral';

export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'in-progress'
  | 'converted'
  | 'closed';

export interface IInquiry extends Document {
  name: string;
  phone: string;
  email?: string;
  serviceType: ServiceType;
  message: string;
  source: InquirySource;
  projectArea?: number;
  budget?: string;
  status: InquiryStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
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
      validate: {
        validator: (v: string) => /^(?:\+?880)?\d{10,11}$/.test(v.replace(/[\s-]/g, '')),
        message: 'Please provide a valid Bangladeshi phone number',
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Please provide a valid email address',
      },
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: {
        values: [
          '2d-drafting',
          '3d-design',
          'boq-estimation',
          'cost-estimator',
          'plan-passing',
          'site-supervision',
          'consultation',
        ],
        message: '{VALUE} is not a valid service type',
      },
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    source: {
      type: String,
      enum: ['website', 'whatsapp', 'phone', 'referral'],
      default: 'website',
    },
    projectArea: {
      type: Number,
      min: [0, 'Project area must be positive'],
    },
    budget: { type: String, trim: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in-progress', 'converted', 'closed'],
      default: 'new',
      index: true,
    },
    notes: { type: String, maxlength: [5000, 'Notes cannot exceed 5000 characters'] },
  },
  {
    timestamps: true,
  }
);

const Inquiry: Model<IInquiry> =
  mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);

export default Inquiry;
