import { z } from 'zod';

// Bangladeshi phone number validation
const bdPhoneRegex = /^(?:\+?880)?\d{10,11}$/;

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((v) => v.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(bdPhoneRegex, 'Please enter a valid Bangladeshi phone number'));

export const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: phoneSchema,
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  serviceType: z.enum([
    '2d-drafting',
    '3d-design',
    'boq-estimation',
    'cost-estimator',
    'plan-passing',
    'site-supervision',
    'consultation',
  ]),
  message: z.string().min(1, 'Message is required').max(2000),
  source: z.enum(['website', 'whatsapp', 'phone', 'referral']).default('website'),
  projectArea: z.number().positive().optional(),
  budget: z.string().optional(),
});

export const costEstimatorSchema = z.object({
  area: z.number().min(100, 'Minimum area is 100 sq. ft.').max(100000, 'Maximum area is 100,000 sq. ft.'),
  floors: z.number().int().min(1, 'Minimum 1 floor').max(20, 'Maximum 20 floors'),
  quality: z.enum(['standard', 'premium', 'luxury']),
});

export const appointmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: phoneSchema,
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  appointmentType: z.enum(['site-visit', 'consultation', 'follow-up']),
  date: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  location: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const planStatusSearchSchema = z.object({
  query: z.string().min(1, 'Please enter a File ID or Phone Number'),
});

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['2d-plan', '3d-exterior', '3d-interior', 'construction']),
  client: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  area: z.number().positive().optional(),
  completionDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
export type CostEstimatorInput = z.infer<typeof costEstimatorSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
