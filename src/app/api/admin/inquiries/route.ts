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

export async function GET(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageInquiries")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status");
    const serviceType = searchParams.get("serviceType");
    const source = searchParams.get("source");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (source) filter.source = source;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }

    const total = await Inquiry.countDocuments(filter);
    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      { data: inquiries, total, page, totalPages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageInquiries")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;
    if (!_id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }
    const inquiry = await Inquiry.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    await logAction("update_inquiry", "Inquiry", (session as any).email, `Status: ${updateData.status || "updated"}`, _id);
    return NextResponse.json({ data: inquiry }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageInquiries")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    if (!body._id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }
    const inquiry = await Inquiry.findByIdAndDelete(body._id);
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    await logAction("delete_inquiry", "Inquiry", (session as any).email, `Deleted inquiry ${body._id}`, body._id);
    return NextResponse.json({ message: "Inquiry deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
