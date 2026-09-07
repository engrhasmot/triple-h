import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MaterialEstimate from "@/models/material-estimate.model";
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
        { estimateNumber: { $regex: search, $options: "i" } },
      ];
    }

    const estimates = await MaterialEstimate.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ estimates });
  } catch (error: any) {
    console.error("[MaterialEstimates GET Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch material estimates" },
      { status: 500 }
    );
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
      estimateNumber,
      clientName,
      clientPhone,
      projectTitle,
      slabArea,
      floors,
      totalBuiltArea,
      buildingType,
      unitRates,
      quantities,
      costs,
      note,
    } = body;

    if (!clientName || !projectTitle || !slabArea || !floors) {
      return NextResponse.json(
        { error: "Client name, project title, slab area, and floors are required." },
        { status: 400 }
      );
    }

    let estimate;
    const actor = (payload as any).username || "Admin";

    if (_id) {
      estimate = await MaterialEstimate.findByIdAndUpdate(
        _id,
        {
          estimateNumber,
          clientName,
          clientPhone,
          projectTitle,
          slabArea: Number(slabArea),
          floors: Number(floors),
          totalBuiltArea: Number(totalBuiltArea),
          buildingType: buildingType || "residential",
          unitRates,
          quantities,
          costs,
          note,
        },
        { new: true }
      );

      if (!estimate) {
        return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
      }

      try {
        await ActivityLog.create({
          action: "UPDATE",
          resource: "MaterialEstimate",
          resourceId: estimate._id.toString(),
          performedBy: actor,
          details: `Updated material estimate ${estimate.estimateNumber} for ${clientName}`,
        });
      } catch {}
    } else {
      const generatedNumber =
        estimateNumber || `EST-${Date.now().toString().slice(-5)}`;

      estimate = await MaterialEstimate.create({
        estimateNumber: generatedNumber,
        clientName,
        clientPhone,
        projectTitle,
        slabArea: Number(slabArea),
        floors: Number(floors),
        totalBuiltArea: Number(totalBuiltArea),
        buildingType: buildingType || "residential",
        unitRates,
        quantities,
        costs,
        note,
        createdBy: actor,
      });

      try {
        await ActivityLog.create({
          action: "CREATE",
          resource: "MaterialEstimate",
          resourceId: estimate._id.toString(),
          performedBy: actor,
          details: `Created new material estimate ${estimate.estimateNumber} for ${clientName}`,
        });
      } catch {}
    }

    return NextResponse.json({ success: true, estimate });
  } catch (error: any) {
    console.error("[MaterialEstimate POST Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save material estimate" },
      { status: 500 }
    );
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

    if (!id) return NextResponse.json({ error: "Estimate ID required" }, { status: 400 });

    const deleted = await MaterialEstimate.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Estimate not found" }, { status: 404 });

    try {
      await ActivityLog.create({
        action: "DELETE",
        resource: "MaterialEstimate",
        resourceId: id,
        performedBy: (payload as any).username || "Admin",
        details: `Deleted material estimate ${deleted.estimateNumber} of ${deleted.clientName}`,
      });
    } catch {}

    return NextResponse.json({ success: true, message: "Estimate deleted" });
  } catch (error: any) {
    console.error("[MaterialEstimate DELETE Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete estimate" },
      { status: 500 }
    );
  }
}
