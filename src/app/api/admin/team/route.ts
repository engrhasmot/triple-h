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

export async function GET(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTeam")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const members = await TeamMember.find().sort({ order: 1 }).lean();
    return NextResponse.json({ data: members }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTeam")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    if (!body.name || !body.designation || !body.bio) {
      return NextResponse.json({ error: "name, designation, and bio are required" }, { status: 400 });
    }
    const member = await TeamMember.create({
      name: body.name,
      designation: body.designation,
      bio: body.bio,
      image: body.image || undefined,
      email: body.email,
      phone: body.phone,
      expertise: body.expertise || [],
      socialLinks: body.socialLinks || [],
      order: body.order ?? 0,
      isActive: body.isActive ?? true,
    });
    await logAction("create_team", "TeamMember", (session as any).email, `Created: ${member.name}`, member._id.toString());
    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create team member" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTeam")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;
    if (!_id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }
    const member = await TeamMember.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    await logAction("update_team", "TeamMember", (session as any).email, `Updated: ${member.name}`, _id);
    return NextResponse.json({ data: member }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTeam")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    if (!body._id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }
    const member = await TeamMember.findByIdAndDelete(body._id);
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    await logAction("delete_team", "TeamMember", (session as any).email, `Deleted: ${member.name}`, body._id);
    return NextResponse.json({ message: "Team member deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
