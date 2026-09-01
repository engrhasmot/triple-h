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

    // Aggregate metrics
    const [
      totalInquiries,
      newInquiries,
      activeProjects,
      pendingFiles,
      newBookings
    ] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Project.countDocuments({ status: 'published' }),
      PlanStatus.countDocuments({ currentStatus: { $in: ['submitted', 'under-review', 'revision-required'] } }),
      Appointment.countDocuments({ status: 'pending' })
    ]);

    // Fetch recent leads (Inquiries)
    const recentLeads = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      metrics: {
        totalInquiries,
        newInquiries,
        activeProjects,
        pendingFiles,
        newBookings
      },
      recentLeads
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
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
