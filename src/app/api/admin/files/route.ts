import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PlanStatus from '@/models/plan-status.model';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { sendSMS, planStatusUpdateSMS } from '@/lib/sms';

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageFiles")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const files = await PlanStatus.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageFiles")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { clientName, phone, projectTitle, location, submissionDate } = body;

    if (!clientName || !phone || !projectTitle || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const planStatus = await PlanStatus.create({
      clientName,
      phone,
      projectTitle,
      location,
      submissionDate: submissionDate ? new Date(submissionDate) : new Date(),
      currentStatus: 'submitted',
      statusHistory: [{
        status: 'submitted',
        note: 'File created',
        updatedBy: (payload as any).email,
        date: new Date(),
      }],
    });

    return NextResponse.json({ success: true, data: planStatus }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create file' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageFiles")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    const { id, currentStatus, remark } = await req.json();

    if (!id || !currentStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const file = await PlanStatus.findById(id);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const newHistoryEntry = {
      status: currentStatus,
      note: remark || '',
      updatedBy: (payload as any).email,
      date: new Date()
    };

    const updated = await PlanStatus.findByIdAndUpdate(
      id,
      {
        currentStatus,
        $push: { statusHistory: newHistoryEntry }
      },
      { new: true }
    );

    // Fire SMS notification (non-blocking)
    if (updated) {
      sendSMS(
        updated.phone,
        planStatusUpdateSMS({
          clientName: updated.clientName,
          fileId: updated.fileId,
          projectTitle: updated.projectTitle,
          newStatus: currentStatus,
          note: remark || '',
        })
      ).catch(err => console.error('[SMS] Failed to send status update SMS:', err));
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update file status' }, { status: 500 });
  }
}
