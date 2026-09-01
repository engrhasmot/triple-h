import mongoose, { Schema, Document, Model } from 'mongoose';

export type AppointmentType = 'site-visit' | 'consultation' | 'follow-up';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export interface IAppointment extends Document {
  name: string;
  phone: string;
  email?: string;
  appointmentType: AppointmentType;
  date: Date;
  timeSlot: string;
  location?: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    appointmentType: {
      type: String,
      required: true,
      enum: {
        values: ['site-visit', 'consultation', 'follow-up'],
        message: '{VALUE} is not a valid appointment type',
      },
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
      validate: {
        validator: (v: Date) => v > new Date(),
        message: 'Appointment date must be in the future',
      },
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    location: { type: String, trim: true },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for checking slot availability
AppointmentSchema.index({ date: 1, timeSlot: 1 });

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
