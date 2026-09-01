import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Appointment from '@/models/appointment.model';
import { appointmentSchema } from '@/lib/validators';
import { sendEmail } from '@/lib/email';
import { newBookingEmail } from '@/lib/email-templates';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, appointmentType, date, timeSlot, location, notes } = body;

    // Zod validation
    const parsed = appointmentSchema.safeParse({ name, phone, email, appointmentType, date, timeSlot, location, notes });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(date);
    if (appointmentDate <= new Date()) {
      return NextResponse.json(
        { error: 'Appointment date must be in the future' },
        { status: 400 }
      );
    }

    await dbConnect();

    const appointment = await Appointment.create({
      name,
      phone,
      email: email || undefined,
      location: location || undefined,
      date: appointmentDate,
      timeSlot: timeSlot || 'TBD',
      appointmentType: appointmentType || 'site-visit',
      notes: notes || undefined,
      status: 'pending',
    });

    sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@tripleh.com.bd',
      ...newBookingEmail({
        name,
        phone,
        date: appointmentDate.toISOString(),
        timeSlot: timeSlot || 'TBD',
        type: appointmentType || 'site-visit',
      }),
    }).catch(err => console.error('Email notification failed:', err));

    return NextResponse.json(
      { success: true, data: { appointmentId: appointment._id } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Booking API Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
