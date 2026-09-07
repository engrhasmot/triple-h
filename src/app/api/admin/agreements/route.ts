import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Agreement from "@/models/agreement.model";
import ActivityLog from "@/models/activity-log.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { clientPhone: { $regex: search, $options: "i" } },
        { projectTitle: { $regex: search, $options: "i" } },
        { agreementNumber: { $regex: search, $options: "i" } },
      ];
    }

    const agreements = await Agreement.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ agreements });
  } catch (error: any) {
    console.error("[Agreements GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch agreements" }, { status: 500 });
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
      _id,
      agreementNumber,
      clientName,
      clientFatherOrHusband,
      clientPhone,
      clientAddress,
      clientNid,
      projectTitle,
      projectLocation,
      landArea,
      floors,
      scopeOfWork,
      totalFee,
      advanceFee,
      dueFee,
      installments,
      terms,
      layoutMode,
      status,
    } = body;

    if (!clientName || !clientPhone || !projectTitle || !totalFee) {
      return NextResponse.json(
        { error: "Client name, phone, project title, and total fee are required." },
        { status: 400 }
      );
    }

    let agreement;
    const actor = (payload as any).username || "Admin";

    if (_id) {
      agreement = await Agreement.findByIdAndUpdate(
        _id,
        {
          agreementNumber,
          clientName,
          clientFatherOrHusband,
          clientPhone,
          clientAddress,
          clientNid,
          projectTitle,
          projectLocation,
          landArea,
          floors,
          scopeOfWork: scopeOfWork || [],
          totalFee: Number(totalFee) || 0,
          advanceFee: Number(advanceFee) || 0,
          dueFee: Math.max(0, (Number(totalFee) || 0) - (Number(advanceFee) || 0)),
          installments: installments || [],
          terms: terms || [],
          layoutMode: layoutMode || "pad",
          status: status || "draft",
        },
        { new: true }
      );

      if (!agreement) {
        return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
      }

      try {
        await ActivityLog.create({
          action: "UPDATE",
          resource: "Agreement",
          resourceId: agreement._id.toString(),
          performedBy: actor,
          details: `Updated agreement ${agreement.agreementNumber} for ${clientName}`,
        });
      } catch {}
    } else {
      const generatedNumber =
        agreementNumber || `AGR-${Date.now().toString().slice(-5)}`;

      agreement = await Agreement.create({
        agreementNumber: generatedNumber,
        clientName,
        clientFatherOrHusband,
        clientPhone,
        clientAddress,
        clientNid,
        projectTitle,
        projectLocation,
        landArea,
        floors,
        scopeOfWork: scopeOfWork || [],
        totalFee: Number(totalFee) || 0,
        advanceFee: Number(advanceFee) || 0,
        dueFee: Math.max(0, (Number(totalFee) || 0) - (Number(advanceFee) || 0)),
        installments: installments || [],
        terms: terms || [],
        layoutMode: layoutMode || "pad",
        status: status || "draft",
        createdBy: actor,
      });

      try {
        await ActivityLog.create({
          action: "CREATE",
          resource: "Agreement",
          resourceId: agreement._id.toString(),
          performedBy: actor,
          details: `Created new agreement ${agreement.agreementNumber} for ${clientName}`,
        });
      } catch {}
    }

    return NextResponse.json({ success: true, agreement });
  } catch (error: any) {
    console.error("[Agreement POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to save agreement" }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: "Agreement ID required" }, { status: 400 });

    const deleted = await Agreement.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });

    try {
      await ActivityLog.create({
        action: "DELETE",
        resource: "Agreement",
        resourceId: id,
        performedBy: (payload as any).username || "Admin",
        details: `Deleted agreement ${deleted.agreementNumber} of ${deleted.clientName}`,
      });
    } catch {}

    return NextResponse.json({ success: true, message: "Agreement deleted" });
  } catch (error: any) {
    console.error("[Agreement DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete agreement" }, { status: 500 });
  }
}
