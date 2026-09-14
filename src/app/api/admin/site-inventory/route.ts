import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteInventory from '@/models/site-inventory.model';
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

// GET — list all inventory items
export async function GET(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project');
    const itemType = searchParams.get('itemType');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};
    if (project && project !== 'all') query.projectName = { $regex: project, $options: 'i' };
    if (itemType && itemType !== 'all') query.itemType = itemType;
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { itemLabel: { $regex: search, $options: 'i' } },
        { challanNo: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await SiteInventory.find(query).sort({ deliveryDate: -1 }).lean();

    // Stats
    const all = await SiteInventory.find().lean();
    const cementBags = all
      .filter((i) => i.itemType === 'cement')
      .reduce((sum, i) => sum + (i.quantity - (i.usedQuantity || 0)), 0);
    const rodTons = all
      .filter((i) => i.itemType === 'rod')
      .reduce((sum, i) => sum + (i.quantity - (i.usedQuantity || 0)), 0);
    const lowStockCount = all.filter((i) => {
      const remaining = i.quantity - (i.usedQuantity || 0);
      return remaining <= i.quantity * 0.1;
    }).length;

    return NextResponse.json({
      success: true,
      data: items,
      stats: {
        totalItems: all.length,
        cementBags,
        rodTons,
        lowStockCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch inventory' }, { status: 500 });
  }
}

// POST — create new inventory entry
export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { projectName, itemType, itemLabel, challanNo, supplier, quantity, unit, usedQuantity, deliveryDate, notes } = body;

    if (!projectName || !itemType || quantity === undefined) {
      return NextResponse.json({ error: 'Project name, item type, and quantity are required' }, { status: 400 });
    }

    await dbConnect();

    const item = await SiteInventory.create({
      projectName,
      itemType,
      itemLabel: itemLabel || itemType,
      challanNo,
      supplier,
      quantity: Number(quantity),
      unit: unit || 'nos',
      usedQuantity: usedQuantity ? Number(usedQuantity) : 0,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
      notes,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create inventory item' }, { status: 500 });
  }
}

// PATCH — update inventory item (e.g. used quantity, notes)
export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, usedQuantity, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await dbConnect();
    const item = await SiteInventory.findById(id);
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    if (usedQuantity !== undefined) {
      item.usedQuantity = Number(usedQuantity);
    }
    if (updates.quantity !== undefined) item.quantity = Number(updates.quantity);
    if (updates.notes !== undefined) item.notes = updates.notes;
    if (updates.supplier !== undefined) item.supplier = updates.supplier;
    if (updates.challanNo !== undefined) item.challanNo = updates.challanNo;
    if (updates.itemLabel !== undefined) item.itemLabel = updates.itemLabel;
    if (updates.unit !== undefined) item.unit = updates.unit;

    await item.save();

    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update item' }, { status: 500 });
  }
}

// DELETE — remove inventory entry
export async function DELETE(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await dbConnect();
    await SiteInventory.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete item' }, { status: 500 });
  }
}
