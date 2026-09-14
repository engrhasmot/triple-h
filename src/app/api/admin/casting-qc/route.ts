import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CastingQC from '@/models/casting-qc.model';
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

// GET — list all casting QC records with optional status and search filter
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
        { projectName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { floor: { $regex: search, $options: 'i' } },
      ];
    }

    const records = await CastingQC.find(query).sort({ castingDate: -1 }).lean();

    const all = await CastingQC.find().lean();
    const passedCount = all.filter((r) => r.status === 'passed').length;
    const failedCount = all.filter((r) => r.status === 'failed').length;
    const pending7Count = all.filter((r) => r.status === 'pending-7day').length;
    const pending28Count = all.filter((r) => r.status === 'pending-28day').length;

    return NextResponse.json({
      success: true,
      data: records,
      stats: {
        total: all.length,
        passed: passedCount,
        failed: failedCount,
        pending7Day: pending7Count,
        pending28Day: pending28Count,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch casting records' }, { status: 500 });
  }
}

// POST — create new casting QC record
export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      projectName,
      castingDate,
      floor,
      location,
      mixRatio,
      cementBrand,
      waterCementRatio,
      vibratorUsed,
      coverBlockUsed,
      preCastingChecklistOk,
      designStrengthPsi,
      notes,
    } = body;

    if (!projectName || !castingDate) {
      return NextResponse.json({ error: 'Project name and casting date are required' }, { status: 400 });
    }

    await dbConnect();

    const record = await CastingQC.create({
      projectName,
      castingDate: new Date(castingDate),
      floor,
      location,
      mixRatio,
      cementBrand,
      waterCementRatio: waterCementRatio ? Number(waterCementRatio) : undefined,
      vibratorUsed: vibratorUsed ?? true,
      coverBlockUsed: coverBlockUsed ?? true,
      preCastingChecklistOk: preCastingChecklistOk ?? false,
      designStrengthPsi: designStrengthPsi ? Number(designStrengthPsi) : 3000,
      notes,
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create casting record' }, { status: 500 });
  }
}

// PATCH — update casting QC record (e.g. cylinder tests)
export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await dbConnect();
    const record = await CastingQC.findById(id);
    if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    if (updates.cylinder7DayPsi !== undefined) {
      record.cylinder7DayPsi = updates.cylinder7DayPsi ? Number(updates.cylinder7DayPsi) : undefined;
    }
    if (updates.cylinder28DayPsi !== undefined) {
      record.cylinder28DayPsi = updates.cylinder28DayPsi ? Number(updates.cylinder28DayPsi) : undefined;
    }
    if (updates.testDate7Day !== undefined) {
      record.testDate7Day = updates.testDate7Day ? new Date(updates.testDate7Day) : undefined;
    }
    if (updates.testDate28Day !== undefined) {
      record.testDate28Day = updates.testDate28Day ? new Date(updates.testDate28Day) : undefined;
    }
    if (updates.designStrengthPsi !== undefined) {
      record.designStrengthPsi = Number(updates.designStrengthPsi);
    }
    if (updates.floor !== undefined) record.floor = updates.floor;
    if (updates.location !== undefined) record.location = updates.location;
    if (updates.mixRatio !== undefined) record.mixRatio = updates.mixRatio;
    if (updates.cementBrand !== undefined) record.cementBrand = updates.cementBrand;
    if (updates.waterCementRatio !== undefined) record.waterCementRatio = updates.waterCementRatio ? Number(updates.waterCementRatio) : undefined;
    if (updates.vibratorUsed !== undefined) record.vibratorUsed = Boolean(updates.vibratorUsed);
    if (updates.coverBlockUsed !== undefined) record.coverBlockUsed = Boolean(updates.coverBlockUsed);
    if (updates.preCastingChecklistOk !== undefined) record.preCastingChecklistOk = Boolean(updates.preCastingChecklistOk);
    if (updates.notes !== undefined) record.notes = updates.notes;

    await record.save();

    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update record' }, { status: 500 });
  }
}

// DELETE — remove a casting QC record
export async function DELETE(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await dbConnect();
    await CastingQC.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete record' }, { status: 500 });
  }
}
