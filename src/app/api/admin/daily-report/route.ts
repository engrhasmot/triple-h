import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/inquiry.model';
import Appointment from '@/models/appointment.model';
import WorkOrder from '@/models/work-order.model';
import PageView from '@/models/pageview.model';
import Payment from '@/models/payment.model';
import PaymentSubmission from '@/models/payment-submission.model';
import PlanStatus from '@/models/plan-status.model';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { sendWhatsApp, dailySummaryWhatsApp } from '@/lib/whatsapp';

const SENDER_NUMBER = '+880 1778-506500';
const DEFAULT_TARGET_NUMBER = '+880 1631-186218';

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      inquiriesLast24h,
      bookingsLast24h,
      workOrdersLast24h,
      pageViewsLast24h,
      pendingInquiries,
      pendingBookings,
      pendingWorkOrders,
      pendingSubmissions,
      activePlans,
      recentPayments,
    ] = await Promise.all([
      Inquiry.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      Appointment.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      WorkOrder.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      PageView.countDocuments({ timestamp: { $gte: oneDayAgo } }),
      Inquiry.countDocuments({ status: 'new' }),
      Appointment.countDocuments({ status: 'pending' }),
      WorkOrder.countDocuments({ status: 'pending' }),
      PaymentSubmission.countDocuments({ status: 'pending' }),
      PlanStatus.countDocuments({
        currentStatus: { $in: ['submitted', 'under-review', 'revision-required'] },
      }),
      Payment.find({ 'installments.paidOn': { $gte: oneDayAgo } }).lean(),
    ]);

    let paymentsReceivedLast24h = 0;
    if (Array.isArray(recentPayments)) {
      for (const p of recentPayments) {
        if (Array.isArray((p as any).installments)) {
          for (const inst of (p as any).installments) {
            if (inst.paidOn && new Date(inst.paidOn) >= oneDayAgo) {
              paymentsReceivedLast24h += inst.amount || 0;
            }
          }
        }
      }
    }

    const dateStr = now.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Dhaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const targetNumber = process.env.DAILY_REPORT_WHATSAPP_NUMBER || DEFAULT_TARGET_NUMBER;

    const reportMessage = dailySummaryWhatsApp({
      date: dateStr,
      inquiriesLast24h,
      bookingsLast24h,
      workOrdersLast24h,
      pageViewsLast24h,
      pendingInquiries,
      pendingBookings,
      pendingWorkOrders,
      paymentsReceivedLast24h,
      pendingSubmissions,
      activePlans,
      senderNumber: SENDER_NUMBER,
      recipientNumber: targetNumber,
    });

    const cleanTarget = targetNumber.replace(/[^0-9]/g, '');
    const formattedTarget = cleanTarget.startsWith('88') ? cleanTarget : `88${cleanTarget}`;
    const directWhatsAppUrl = `https://wa.me/${formattedTarget}?text=${encodeURIComponent(reportMessage)}`;

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        senderNumber: SENDER_NUMBER,
        targetNumber,
        inquiriesLast24h,
        bookingsLast24h,
        workOrdersLast24h,
        pageViewsLast24h,
        paymentsReceivedLast24h,
        pendingInquiries,
        pendingBookings,
        pendingWorkOrders,
        pendingSubmissions,
        activePlans,
        reportMessage,
        directWhatsAppUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const customTarget = body.targetNumber;

    await dbConnect();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      inquiriesLast24h,
      bookingsLast24h,
      workOrdersLast24h,
      pageViewsLast24h,
      pendingInquiries,
      pendingBookings,
      pendingWorkOrders,
      pendingSubmissions,
      activePlans,
      recentPayments,
    ] = await Promise.all([
      Inquiry.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      Appointment.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      WorkOrder.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      PageView.countDocuments({ timestamp: { $gte: oneDayAgo } }),
      Inquiry.countDocuments({ status: 'new' }),
      Appointment.countDocuments({ status: 'pending' }),
      WorkOrder.countDocuments({ status: 'pending' }),
      PaymentSubmission.countDocuments({ status: 'pending' }),
      PlanStatus.countDocuments({
        currentStatus: { $in: ['submitted', 'under-review', 'revision-required'] },
      }),
      Payment.find({ 'installments.paidOn': { $gte: oneDayAgo } }).lean(),
    ]);

    let paymentsReceivedLast24h = 0;
    if (Array.isArray(recentPayments)) {
      for (const p of recentPayments) {
        if (Array.isArray((p as any).installments)) {
          for (const inst of (p as any).installments) {
            if (inst.paidOn && new Date(inst.paidOn) >= oneDayAgo) {
              paymentsReceivedLast24h += inst.amount || 0;
            }
          }
        }
      }
    }

    const dateStr = now.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Dhaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const targetNumber = customTarget || process.env.DAILY_REPORT_WHATSAPP_NUMBER || DEFAULT_TARGET_NUMBER;

    const reportMessage = dailySummaryWhatsApp({
      date: dateStr,
      inquiriesLast24h,
      bookingsLast24h,
      workOrdersLast24h,
      pageViewsLast24h,
      pendingInquiries,
      pendingBookings,
      pendingWorkOrders,
      paymentsReceivedLast24h,
      pendingSubmissions,
      activePlans,
      senderNumber: SENDER_NUMBER,
      recipientNumber: targetNumber,
    });

    // Send via WhatsApp API
    const waResult = await sendWhatsApp(reportMessage, targetNumber);

    const cleanTarget = targetNumber.replace(/[^0-9]/g, '');
    const formattedTarget = cleanTarget.startsWith('88') ? cleanTarget : `88${cleanTarget}`;
    const directWhatsAppUrl = `https://wa.me/${formattedTarget}?text=${encodeURIComponent(reportMessage)}`;

    return NextResponse.json({
      success: true,
      message: `Daily report sent to ${targetNumber}`,
      data: {
        date: dateStr,
        senderNumber: SENDER_NUMBER,
        targetNumber,
        whatsappSent: waResult.success,
        whatsappProvider: waResult.provider,
        whatsappMessage: waResult.message,
        directWhatsAppUrl,
        reportMessage,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
