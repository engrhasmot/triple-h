import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SoilTest from '@/models/soil-test.model';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission((payload as any).role, 'canManagePayments'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const tests = await SoilTest.find(filter).sort({ date: -1 }).lean();
    return NextResponse.json({ success: true, tests });
  } catch (error: any) {
    console.error('SoilTest GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch soil tests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission((payload as any).role, 'canManagePayments'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await dbConnect();
    const body = await req.json();
    const {
      projectName,
      location,
      date,
      boreholeNo,
      boreholeDepth,
      layers,
      groundwaterDepth,
      recommendedPileDepth,
      notes,
    } = body;

    if (!projectName?.trim() || !date) {
      return NextResponse.json({ error: 'Project name and date are required' }, { status: 400 });
    }

    const test = await SoilTest.create({
      projectName: projectName.trim(),
      location: location || undefined,
      date: new Date(date),
      boreholeNo: boreholeNo || undefined,
      boreholeDepth: boreholeDepth ? Number(boreholeDepth) : undefined,
      layers: (layers || []).map((l: any) => ({
        depthFrom: Number(l.depthFrom || 0),
        depthTo: Number(l.depthTo || 0),
        soilType: l.soilType || '',
        nValue: Number(l.nValue || 0),
        allowableBearing: 0,
      })),
      groundwaterDepth: groundwaterDepth ? Number(groundwaterDepth) : undefined,
      recommendedPileDepth: recommendedPileDepth ? Number(recommendedPileDepth) : undefined,
      notes: notes || undefined,
    });

    return NextResponse.json({ success: true, test }, { status: 201 });
  } catch (error: any) {
    console.error('SoilTest POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create soil test' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission((payload as any).role, 'canManagePayments'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await dbConnect();
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) return NextResponse.json({ error: 'Soil test ID is required' }, { status: 400 });

    const test = await SoilTest.findById(id);
    if (!test) return NextResponse.json({ error: 'Soil test not found' }, { status: 404 });

    Object.assign(test, fields);
    await test.save();

    return NextResponse.json({ success: true, test });
  } catch (error: any) {
    console.error('SoilTest PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update soil test' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission((payload as any).role, 'canManagePayments'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Soil test ID is required' }, { status: 400 });

    const deleted = await SoilTest.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Soil test not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Soil test deleted successfully' });
  } catch (error: any) {
    console.error('SoilTest DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete soil test' }, { status: 500 });
  }
}
