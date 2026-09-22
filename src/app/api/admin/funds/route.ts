import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProjectFund from "@/models/project-fund.model";
import Project from "@/models/project.model";
import ActivityLog from "@/models/activity-log.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const filter: Record<string, any> = {};
    if (projectId && projectId !== "all") {
      if (projectId === "general-office") {
        filter.$or = [{ projectId: null }, { projectId: { $exists: false } }, { projectName: "General / Office Overhead" }];
      } else if (mongoose.Types.ObjectId.isValid(projectId)) {
        filter.projectId = new mongoose.Types.ObjectId(projectId);
      }
    }

    const funds = await ProjectFund.find(filter).sort({ date: -1 }).lean();
    const totalDeposited = funds.reduce((acc, f) => acc + (f.amount || 0), 0);

    return NextResponse.json({
      success: true,
      funds,
      totalDeposited,
    });
  } catch (error: any) {
    console.error("Funds GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch funds" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const body = await req.json();
    const {
      title,
      amount,
      date,
      source,
      depositedBy,
      paymentMethod,
      referenceNo,
      attachmentUrl,
      notes,
      projectId,
      projectName,
    } = body;

    if (!title || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Title and a valid deposit amount are required" }, { status: 400 });
    }

    let resolvedProjectId = null;
    let resolvedProjectName = projectName || "General / Office Overhead";

    if (projectId && projectId !== "general-office" && mongoose.Types.ObjectId.isValid(projectId)) {
      resolvedProjectId = new mongoose.Types.ObjectId(projectId);
      const proj = await Project.findById(resolvedProjectId).select("title").lean();
      if (proj) {
        resolvedProjectName = proj.title;
      }
    }

    const fund = await ProjectFund.create({
      title: title.trim(),
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      source: source || "owner-equity",
      depositedBy: depositedBy ? depositedBy.trim() : "Management",
      paymentMethod: paymentMethod || "bank",
      referenceNo: referenceNo ? referenceNo.trim() : "",
      attachmentUrl: attachmentUrl ? attachmentUrl.trim() : "",
      notes: notes ? notes.trim() : "",
      projectId: resolvedProjectId,
      projectName: resolvedProjectName,
      createdBy: (payload as any).email || "admin",
    });

    try {
      await ActivityLog.create({
        action: "CREATE",
        resource: "ProjectFund",
        resourceId: fund._id.toString(),
        performedBy: (payload as any).email || "admin",
        details: `Deposited balance fund of ৳${fund.amount} for "${fund.projectName}" [${fund.source}]`,
      });
    } catch {}

    return NextResponse.json({ success: true, fund }, { status: 201 });
  } catch (error: any) {
    console.error("Funds POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to add balance fund" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Fund deposit ID is required" }, { status: 400 });

    const deleted = await ProjectFund.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Deposit record not found" }, { status: 404 });

    try {
      await ActivityLog.create({
        action: "DELETE",
        resource: "ProjectFund",
        resourceId: id,
        performedBy: (payload as any).email || "admin",
        details: `Deleted fund deposit "${deleted.title}" (৳${deleted.amount})`,
      });
    } catch {}

    return NextResponse.json({ success: true, message: "Deposit record deleted successfully" });
  } catch (error: any) {
    console.error("Funds DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete deposit record" }, { status: 500 });
  }
}
