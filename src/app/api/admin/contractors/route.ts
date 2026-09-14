import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contractor from '@/models/contractor.model';
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
    const specialty = searchParams.get('specialty');
    const search = searchParams.get('search');

    const filter: Record<string, any> = { isActive: true };
    if (specialty && specialty !== 'all') filter.specialty = specialty;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
      ];
    }

    const contractors = await Contractor.find(filter).sort({ rating: -1 }).lean();
    return NextResponse.json({ success: true, contractors });
  } catch (error: any) {
    console.error('Contractors GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch contractors' }, { status: 500 });
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
    const { name, phone, specialty, experienceYears, rating, area, notes, lastWorked } = body;

    if (!name?.trim() || !phone?.trim() || !specialty) {
      return NextResponse.json({ error: 'Name, phone, and specialty are required' }, { status: 400 });
    }

    const contractor = await Contractor.create({
      name: name.trim(),
      phone: phone.trim(),
      specialty,
      experienceYears:
        experienceYears !== undefined && experienceYears !== ''
          ? Number(experienceYears)
          : undefined,
      rating: rating ? Number(rating) : 3,
      area: area || undefined,
      notes: notes || undefined,
      lastWorked: lastWorked ? new Date(lastWorked) : undefined,
      isActive: true,
    });

    return NextResponse.json({ success: true, contractor }, { status: 201 });
  } catch (error: any) {
    console.error('Contractors POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create contractor' }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: 'Contractor ID is required' }, { status: 400 });

    if (fields.rating !== undefined) fields.rating = Number(fields.rating);
    if (fields.experienceYears !== undefined) fields.experienceYears = Number(fields.experienceYears);
    if (fields.lastWorked) fields.lastWorked = new Date(fields.lastWorked);

    const updated = await Contractor.findByIdAndUpdate(
      id,
      { $set: fields },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });

    return NextResponse.json({ success: true, contractor: updated });
  } catch (error: any) {
    console.error('Contractors PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update contractor' }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: 'Contractor ID is required' }, { status: 400 });

    const updated = await Contractor.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();
    if (!updated) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Contractor deactivated successfully' });
  } catch (error: any) {
    console.error('Contractors DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete contractor' }, { status: 500 });
  }
}
