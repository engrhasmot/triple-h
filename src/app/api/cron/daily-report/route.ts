import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/inquiry.model';
import Appointment from '@/models/appointment.model';
import WorkOrder from '@/models/work-order.model';
import PageView from '@/models/pageview.model';
import Payment from '@/models/payment.model';
import PaymentSubmission from '@/models/payment-submission.model';
import PlanStatus from '@/models/plan-status.model';
import { sendWhatsApp, dailySummaryWhatsApp } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

const SENDER_NUMBER = '+880 1778-506500';
const DEFAULT_TARGET_NUMBER = '+880 1631-186218';

export async function handleDailyReport(req: Request) {
  try {
    // Optional secret check if CRON_SECRET is set
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
      // If called from admin or without secret in dev, allow if it's internal or admin
    }

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

    // Calculate total payments received in last 24h
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

    // Send to primary target (+880 1631-186218)
    const waResult = await sendWhatsApp(reportMessage, targetNumber);

    // Also send to admin if configured and different
    let adminResult = null;
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
    if (adminNumber && adminNumber.replace(/[^0-9]/g, '') !== targetNumber.replace(/[^0-9]/g, '')) {
      adminResult = await sendWhatsApp(reportMessage, adminNumber);
    }

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
        whatsappSent: waResult.success,
        whatsappResult: waResult,
        adminResult,
        directWhatsAppUrl,
        reportMessage,
      },
    });
  } catch (error: any) {
    console.error('[Daily Report Error]:', error);
    return NextResponse.json(
      { error: 'Failed to generate and send daily report', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleDailyReport(req);
}

export async function POST(req: Request) {
  return handleDailyReport(req);
}
