import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Inspection from "@/models/inspection.model";
import ActivityLog from "@/models/activity-log.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { sendWhatsApp, inspectionReportWhatsApp } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const stage = searchParams.get("stage");

    const filter: Record<string, any> = {};
    if (stage && stage !== "all") {
      filter.stage = stage;
    }
    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { clientPhone: { $regex: search, $options: "i" } },
        { projectTitle: { $regex: search, $options: "i" } },
        { reportNumber: { $regex: search, $options: "i" } },
      ];
    }

    const inspections = await Inspection.find(filter).sort({ inspectionDate: -1 }).lean();
    return NextResponse.json({ inspections });
  } catch (error: any) {
    console.error("[Inspections GET Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch inspections" }, { status: 500 });
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
      reportNumber,
      clientName,
      clientPhone,
      projectTitle,
      projectLocation,
      inspectionDate,
      stage,
      inspectorName,
      checklist,
      observations,
      instructions,
      photos,
      status,
      nextVisitDate,
      sendWhatsAppNotice,
    } = body;

    if (!clientName || !clientPhone || !projectTitle || !stage || !observations || !instructions) {
      return NextResponse.json(
        { error: "Client name, phone, project title, stage, observations, and instructions are required." },
        { status: 400 }
      );
    }

    let inspection;
    const actor = (payload as any).username || "Admin";

    if (_id) {
      inspection = await Inspection.findByIdAndUpdate(
        _id,
        {
          reportNumber,
          clientName,
          clientPhone,
          projectTitle,
          projectLocation,
          inspectionDate: inspectionDate ? new Date(inspectionDate) : new Date(),
          stage,
          inspectorName: inspectorName || "ইঞ্জিনিয়ার মোঃ হাসমত আলী",
          checklist: checklist || [],
          observations,
          instructions,
          photos: photos || [],
          status: status || "satisfactory",
          nextVisitDate,
        },
        { new: true }
      );

      if (!inspection) {
        return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
      }

      try {
        await ActivityLog.create({
          action: "UPDATE",
          resource: "Inspection",
          resourceId: inspection._id.toString(),
          performedBy: actor,
          details: `Updated inspection report ${inspection.reportNumber} for ${clientName}`,
        });
      } catch {}
    } else {
      const generatedNumber =
        reportNumber || `INS-${Date.now().toString().slice(-5)}`;

      inspection = await Inspection.create({
        reportNumber: generatedNumber,
        clientName,
        clientPhone,
        projectTitle,
        projectLocation,
        inspectionDate: inspectionDate ? new Date(inspectionDate) : new Date(),
        stage,
        inspectorName: inspectorName || "ইঞ্জিনিয়ার মোঃ হাসমত আলী",
        checklist: checklist || [],
        observations,
        instructions,
        photos: photos || [],
        status: status || "satisfactory",
        nextVisitDate,
        createdBy: actor,
      });

      try {
        await ActivityLog.create({
          action: "CREATE",
          resource: "Inspection",
          resourceId: inspection._id.toString(),
          performedBy: actor,
          details: `Created new inspection report ${inspection.reportNumber} for ${clientName}`,
        });
      } catch {}
    }

    // Optional WhatsApp notice
    if (sendWhatsAppNotice) {
      try {
        sendWhatsApp(
          inspectionReportWhatsApp({
            clientName: inspection.clientName,
            reportNumber: inspection.reportNumber,
            projectTitle: inspection.projectTitle,
            stage: inspection.stage,
            status: inspection.status,
            observations: inspection.observations,
            instructions: inspection.instructions,
            nextVisitDate: inspection.nextVisitDate,
          }),
          inspection.clientPhone
        ).catch((err) => console.error("[WhatsApp Inspection Error]:", err));
      } catch (waErr) {
        console.error("[WhatsApp Dispatch Fail]:", waErr);
      }
    }

    return NextResponse.json({ success: true, inspection });
  } catch (error: any) {
    console.error("[Inspection POST Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to save inspection" }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: "Inspection ID required" }, { status: 400 });

    const deleted = await Inspection.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Inspection not found" }, { status: 404 });

    try {
      await ActivityLog.create({
        action: "DELETE",
        resource: "Inspection",
        resourceId: id,
        performedBy: (payload as any).username || "Admin",
        details: `Deleted inspection report ${deleted.reportNumber} of ${deleted.clientName}`,
      });
    } catch {}

    return NextResponse.json({ success: true, message: "Inspection deleted" });
  } catch (error: any) {
    console.error("[Inspection DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete inspection" }, { status: 500 });
  }
}
