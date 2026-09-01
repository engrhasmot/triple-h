import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/payment.model';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

// GET — list all payments with optional filters
export async function GET(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } },
        { planFileRef: { $regex: search, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 }).lean();

    // Summary stats
    const all = await Payment.find().lean();
    const totalCollected = all.reduce((s, p) => s + p.paidAmount, 0);
    const totalOutstanding = all.reduce((s, p) => s + p.dueAmount, 0);
    const totalAmount = all.reduce((s, p) => s + p.totalAmount, 0);

    return NextResponse.json({
      success: true,
      data: payments,
      stats: { totalCollected, totalOutstanding, totalAmount, count: all.length },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// POST — create new payment record
export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { clientName, phone, projectTitle, serviceType, totalAmount, dueDate, planFileRef, notes } = body;

    if (!clientName || !phone || !projectTitle || !serviceType || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const payment = await Payment.create({
      clientName,
      phone,
      projectTitle,
      serviceType,
      totalAmount: Number(totalAmount),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      planFileRef,
      notes,
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create payment';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — add installment or update payment
export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, action, installment, notes, totalAmount, dueDate } = body;

    if (!id) return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });

    await dbConnect();
    const payment = await Payment.findById(id);
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    if (action === 'add-installment' && installment) {
      payment.installments.push({
        ...installment,
        receivedBy: (payload as { email?: string }).email || 'admin',
        paidOn: installment.paidOn ? new Date(installment.paidOn) : new Date(),
      });
    }

    if (notes !== undefined) payment.notes = notes;
    if (totalAmount !== undefined) payment.totalAmount = Number(totalAmount);
    if (dueDate !== undefined) payment.dueDate = dueDate ? new Date(dueDate) : undefined;

    await payment.save(); // triggers pre-save auto-recalc

    return NextResponse.json({ success: true, data: payment });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update payment';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE — delete a payment record
export async function DELETE(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await dbConnect();
    await Payment.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
