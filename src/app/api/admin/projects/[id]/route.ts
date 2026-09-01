import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/project.model';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { logAction } from '@/lib/activity-log';
import { hasPermission } from '@/lib/permissions';

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const project = await Project.findById(id).lean();
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ data: project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const update: any = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.category !== undefined) update.category = body.category;
    if (body.client !== undefined) update.client = body.client;
    if (body.location !== undefined) update.location = body.location;
    if (body.area !== undefined) update.area = body.area;
    if (body.tags !== undefined) update.tags = body.tags;
    if (body.status !== undefined) update.status = body.status;
    if (body.images !== undefined) update.images = body.images;
    if (body.featured !== undefined) update.featured = body.featured;

    const updated = await Project.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    await logAction("update_project", "Project", (payload as any).email, `Updated: ${updated.title}`, id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    await logAction("delete_project", "Project", (payload as any).email, `Deleted: ${deleted.title}`, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 500 });
  }
}
