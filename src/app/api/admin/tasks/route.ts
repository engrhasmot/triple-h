import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/task.model';
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
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = { $regex: assignedTo, $options: 'i' };

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error('Tasks GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tasks' }, { status: 500 });
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
    const { title, description, assignedTo, projectRef, dueDate, priority, status, notes } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || undefined,
      assignedTo: assignedTo || undefined,
      projectRef: projectRef || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'medium',
      status: status || 'todo',
      notes: notes || undefined,
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    console.error('Tasks POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

    const updated = await Task.findByIdAndUpdate(
      id,
      { $set: fields },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    return NextResponse.json({ success: true, task: updated });
  } catch (error: any) {
    console.error('Tasks PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update task' }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Tasks DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete task' }, { status: 500 });
  }
}
