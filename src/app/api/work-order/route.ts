import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WorkOrder from '@/models/work-order.model';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const workOrderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^(?:\+?880)?\d{10,11}$/, 'Invalid Bangladeshi phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  projectTitle: z.string().min(3, 'Project title is required'),
  projectLocation: z.string().min(3, 'Project location is required'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  estimatedBudget: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = workOrderSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    await dbConnect();

    const workOrder = await WorkOrder.create({
      ...parsed.data,
      status: 'pending',
    });

    sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@tripleh.com.bd',
      subject: `New Work Order Request from ${parsed.data.name}`,
      html: `A new work order request has been submitted.\n\nName: ${parsed.data.name}\nPhone: ${parsed.data.phone}\nProject: ${parsed.data.projectTitle}\nLocation: ${parsed.data.projectLocation}\nRequirements:\n${parsed.data.requirements}`,
    }).catch(err => console.error('Email notification failed:', err));

    return NextResponse.json(
      { success: true, data: { workOrderId: workOrder._id } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Work Order API Error:', error);
    return NextResponse.json({ error: 'Failed to submit work order' }, { status: 500 });
  }
}
