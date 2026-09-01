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

export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await req.json();
    await dbConnect();
    const project = await Project.create(body);
    await logAction("create_project", "Project", (payload as any).email, project.title, project._id.toString());
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const { id, featured, title, description, category, location, area, tags, status } = await req.json();
    await dbConnect();

    const update: any = {};
    if (featured !== undefined) update.featured = featured;
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (category !== undefined) update.category = category;
    if (location !== undefined) update.location = location;
    if (area !== undefined) update.area = area;
    if (tags !== undefined) update.tags = tags;
    if (status !== undefined) update.status = status;

    const updated = await Project.findByIdAndUpdate(id, update, { new: true });
    await logAction("update_project", "Project", (payload as any).email, `Updated: ${updated?.title || id}`, id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });

    await dbConnect();
    const deleted = await Project.findByIdAndDelete(id);
    await logAction("delete_project", "Project", (payload as any).email, `Deleted: ${deleted?.title || id}`, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
