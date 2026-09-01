import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Inquiry from "@/models/inquiry.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { logAction } from "@/lib/activity-log";
import { hasPermission } from "@/lib/permissions";

async function authenticate(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageInquiries")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { id } = await params;
    const inquiry = await Inquiry.findById(id).lean();
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ data: inquiry }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch inquiry" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageInquiries")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const inquiry = await Inquiry.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    await logAction("update_inquiry", "Inquiry", (session as any).email, `Status: ${body.status || "updated"}`, id);
    return NextResponse.json({ data: inquiry }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update inquiry" },
      { status: 500 }
    );
  }
}
