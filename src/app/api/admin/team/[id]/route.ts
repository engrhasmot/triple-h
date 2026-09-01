import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TeamMember from "@/models/team-member.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { logAction } from "@/lib/activity-log";
import { hasPermission } from "@/lib/permissions";

async function authenticate(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTeam")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { id } = await params;
    const member = await TeamMember.findById(id).lean();
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json({ data: member }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch team member" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTeam")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const member = await TeamMember.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    await logAction("update_team", "TeamMember", (session as any).email, `Updated: ${member.name}`, id);
    return NextResponse.json({ data: member }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTeam")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { id } = await params;
    const member = await TeamMember.findByIdAndDelete(id);
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    await logAction("delete_team", "TeamMember", (session as any).email, `Deleted: ${member.name}`, id);
    return NextResponse.json({ message: "Team member deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
