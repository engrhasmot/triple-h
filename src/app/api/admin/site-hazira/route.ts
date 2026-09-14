import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteHazira from '@/models/site-hazira.model';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  if (!hasPermission((payload as any).role, 'canManagePayments')) return null;
  return payload;
}

// GET — list all attendance records
export async function GET(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project');

    const query: Record<string, unknown> = {};
    if (project && project !== 'all') {
      query.projectName = { $regex: project, $options: 'i' };
    }

    const records = await SiteHazira.find(query).sort({ date: -1 }).lean();

    // Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const all = await SiteHazira.find().lean();
    const todayRecords = all.filter((r) => {
      const d = new Date(r.date);
      return d >= today && d < tomorrow;
    });
    const todayWage = todayRecords.reduce((sum, r) => sum + (r.totalWage || 0), 0);

    const monthRecords = all.filter((r) => {
      const d = new Date(r.date);
      return d >= firstDayOfMonth;
    });
    const monthWage = monthRecords.reduce((sum, r) => sum + (r.totalWage || 0), 0);

    return NextResponse.json({
      success: true,
      data: records,
      stats: {
        totalRecords: all.length,
        todayWage,
        monthWage,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch hazira' }, { status: 500 });
  }
}

// POST — create new hazira record
export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { projectName, date, workers, notes } = body;

    if (!projectName || !date) {
      return NextResponse.json({ error: 'Project name and date are required' }, { status: 400 });
    }

    await dbConnect();

    const formattedWorkers = Array.isArray(workers)
      ? workers.map((w: any) => ({
          name: w.name,
          role: w.role || 'other',
          present: w.present !== undefined ? Boolean(w.present) : true,
          dailyWage: Number(w.dailyWage || 0),
        }))
      : [];

    const record = await SiteHazira.create({
      projectName,
      date: new Date(date),
      workers: formattedWorkers,
      notes,
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create hazira record' }, { status: 500 });
  }
}

// PATCH — update hazira record
export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, projectName, date, workers, notes } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await dbConnect();
    const record = await SiteHazira.findById(id);
    if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    if (projectName) record.projectName = projectName;
    if (date) record.date = new Date(date);
    if (notes !== undefined) record.notes = notes;
    if (Array.isArray(workers)) {
      record.workers = workers.map((w: any) => ({
        name: w.name,
        role: w.role || 'other',
        present: w.present !== undefined ? Boolean(w.present) : true,
        dailyWage: Number(w.dailyWage || 0),
      }));
    }

    await record.save();

    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update hazira' }, { status: 500 });
  }
}

// DELETE — remove hazira entry
export async function DELETE(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await dbConnect();
    await SiteHazira.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete hazira' }, { status: 500 });
  }
}
