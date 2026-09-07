import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/inquiry.model';
import Project from '@/models/project.model';
import PlanStatus from '@/models/plan-status.model';
import Appointment from '@/models/appointment.model';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

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

    // Aggregate metrics with resilient defaults
    let totalInquiries = 0;
    let newInquiries = 0;
    let activeProjects = 0;
    let pendingFiles = 0;
    let newBookings = 0;

    try {
      const results = await Promise.allSettled([
        Inquiry.countDocuments(),
        Inquiry.countDocuments({ status: 'new' }),
        Project.countDocuments({ status: 'published' }),
        PlanStatus.countDocuments({ currentStatus: { $in: ['submitted', 'under-review', 'revision-required'] } }),
        Appointment.countDocuments({ status: 'pending' }),
      ]);

      if (results[0].status === 'fulfilled') totalInquiries = results[0].value;
      if (results[1].status === 'fulfilled') newInquiries = results[1].value;
      if (results[2].status === 'fulfilled') activeProjects = results[2].value;
      if (results[3].status === 'fulfilled') pendingFiles = results[3].value;
      if (results[4].status === 'fulfilled') newBookings = results[4].value;
    } catch (countErr) {
      console.error('Metrics count error:', countErr);
    }

    // Fetch recent leads (Inquiries)
    let recentLeads: any[] = [];
    try {
      recentLeads = await Inquiry.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    } catch (leadErr) {
      console.error('Recent leads fetch error:', leadErr);
    }

    // Fetch today's scheduled appointments safely
    let todayAppointments: any[] = [];
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      todayAppointments = await Appointment.find({
        date: { $gte: startOfToday, $lte: endOfToday },
        status: { $ne: 'cancelled' },
      }).sort({ timeSlot: 1 }).lean();
    } catch (aptErr) {
      console.warn("Could not fetch today's appointments:", aptErr);
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalInquiries,
        newInquiries,
        activeProjects,
        pendingFiles,
        newBookings,
      },
      recentLeads: JSON.parse(JSON.stringify(recentLeads)),
      todayAppointments: JSON.parse(JSON.stringify(todayAppointments)),
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to fetch dashboard data',
        metrics: {
          totalInquiries: 0,
          newInquiries: 0,
          activeProjects: 0,
          pendingFiles: 0,
          newBookings: 0,
        },
        recentLeads: [],
        todayAppointments: [],
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, status } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    const updated = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!updated) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
