import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import WorkOrder from "@/models/work-order.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
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
  // Reusing inquiry permission for simplicity, ideally add new permission canManageWorkOrders
  if (!hasPermission((session as any).role, "canManageInquiries")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { phone: regex }, { email: regex }, { projectTitle: regex }];
    }

    const total = await WorkOrder.countDocuments(filter);
    const workOrders = await WorkOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      { data: workOrders, total, page, totalPages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch work orders" }, { status: 500 });
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
    const workOrder = await WorkOrder.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!workOrder) {
      return NextResponse.json({ error: "Work Order not found" }, { status: 404 });
    }
    return NextResponse.json({ data: workOrder }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update work order" },
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
    const workOrder = await WorkOrder.findByIdAndDelete(body._id);
    if (!workOrder) {
      return NextResponse.json({ error: "Work Order not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Work Order deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete work order" }, { status: 500 });
  }
}
