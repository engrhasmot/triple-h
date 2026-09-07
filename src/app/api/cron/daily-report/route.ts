import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/inquiry.model';
import Appointment from '@/models/appointment.model';
import WorkOrder from '@/models/work-order.model';
import PageView from '@/models/pageview.model';
import { sendWhatsApp, dailySummaryWhatsApp } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Optional secret check if CRON_SECRET is set
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    ] = await Promise.all([
      Inquiry.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      Appointment.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      WorkOrder.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      PageView.countDocuments({ timestamp: { $gte: oneDayAgo } }),
      Inquiry.countDocuments({ status: 'new' }),
      Appointment.countDocuments({ status: 'pending' }),
      WorkOrder.countDocuments({ status: 'pending' }),
    ]);

    const dateStr = now.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Dhaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const reportMessage = dailySummaryWhatsApp({
      date: dateStr,
      inquiriesLast24h,
      bookingsLast24h,
      workOrdersLast24h,
      pageViewsLast24h,
      pendingInquiries,
      pendingBookings,
      pendingWorkOrders,
    });

    const waResult = await sendWhatsApp(reportMessage);

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        inquiriesLast24h,
        bookingsLast24h,
        workOrdersLast24h,
        pageViewsLast24h,
        pendingInquiries,
        pendingBookings,
        pendingWorkOrders,
        whatsappSent: waResult.success,
      },
    });
  } catch (error: any) {
    console.error('[Daily Report Cron Error]:', error);
    return NextResponse.json(
      { error: 'Failed to generate and send daily report' },
      { status: 500 }
    );
  }
}
