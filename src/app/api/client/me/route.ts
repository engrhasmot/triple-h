import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import ClientUser from "@/models/client-user.model";
import PlanStatus from "@/models/plan-status.model";
import Payment from "@/models/payment.model";
import Inspection from "@/models/inspection.model";
import Agreement from "@/models/agreement.model";
import { verifyClientToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("client_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload: any = await verifyClientToken(token);
    if (!payload || !payload.clientId) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    await dbConnect();

    const client = await ClientUser.findById(payload.clientId).lean();
    if (!client || !client.isActive) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const cleanPhone = client.phone.replace(/[+\s-]/g, "").replace(/^880/, "0");
    const fileIds = (client.linkedFiles || []).map((f) => f.toUpperCase());

    // Fetch all plans / projects matching phone or linked file IDs
    const plansQuery: Record<string, any> = {
      $or: [
        { phone: { $regex: cleanPhone, $options: "i" } },
        { phone: { $regex: client.phone, $options: "i" } },
      ],
    };
    if (fileIds.length > 0) {
      plansQuery.$or.push({ fileId: { $in: fileIds } });
    }

    const files = await PlanStatus.find(plansQuery).sort({ createdAt: -1 }).lean();

    // Fetch payments matching phone or planFileRef
    const paymentQuery: Record<string, any> = {
      $or: [
        { phone: { $regex: cleanPhone, $options: "i" } },
        { phone: { $regex: client.phone, $options: "i" } },
      ],
    };
    if (fileIds.length > 0) {
      paymentQuery.$or.push({ planFileRef: { $in: fileIds } });
    }
    const payments = await Payment.find(paymentQuery).sort({ createdAt: -1 }).lean();

    // Fetch site inspections
    const projectTitles = files.map((f) => f.projectTitle).filter(Boolean);
    const inspectionQuery: Record<string, any> = {
      $or: [
        { clientPhone: { $regex: cleanPhone, $options: "i" } },
        { clientPhone: { $regex: client.phone, $options: "i" } },
      ],
    };
    if (projectTitles.length > 0) {
      inspectionQuery.$or.push({ projectTitle: { $in: projectTitles } });
    }
    const inspections = await Inspection.find(inspectionQuery).sort({ inspectionDate: -1 }).lean();

    // Fetch agreements
    const agreementQuery: Record<string, any> = {
      $or: [
        { clientPhone: { $regex: cleanPhone, $options: "i" } },
        { clientPhone: { $regex: client.phone, $options: "i" } },
      ],
    };
    if (projectTitles.length > 0) {
      agreementQuery.$or.push({ projectTitle: { $in: projectTitles } });
    }
    const agreements = await Agreement.find(agreementQuery).sort({ createdAt: -1 }).lean();

    // Aggregate financial stats
    let totalContract = 0;
    let totalPaid = 0;
    let totalDue = 0;

    payments.forEach((p: any) => {
      totalContract += Number(p.totalAmount || 0);
      totalPaid += Number(p.paidAmount || 0);
      totalDue += Number(p.dueAmount || 0);
    });

    // Merge each project with its matching payments, inspections, and agreements
    const projectsWithDetails = files.map((file) => {
      const filePayments = payments.filter(
        (p) => p.planFileRef === file.fileId || p.phone === file.phone
      );
      const fileInspections = inspections.filter(
        (i) => i.projectTitle === file.projectTitle || i.clientPhone === file.phone
      );
      const fileAgreements = agreements.filter(
        (a) => a.projectTitle === file.projectTitle || a.clientPhone === file.phone
      );

      return {
        ...file,
        payments: filePayments,
        inspections: fileInspections,
        agreements: fileAgreements,
      };
    });

    // If client has payment records without a PlanStatus file, formulate pseudo project cards
    if (files.length === 0 && payments.length > 0) {
      payments.forEach((p) => {
        projectsWithDetails.push({
          fileId: p.planFileRef || "TH-PENDING",
          projectTitle: p.projectTitle,
          clientName: p.clientName,
          location: "ঢাকা, বাংলাদেশ",
          currentStatus: "in-progress",
          progressPercentage: p.paidAmount >= p.totalAmount ? 100 : Math.round((p.paidAmount / (p.totalAmount || 1)) * 100),
          milestones: [
            { title: "Project Inception & Consultation", status: "completed" },
            { title: "Architectural & Structural Drafting", status: "in-progress" },
            { title: "Final Delivery & Client Review", status: "pending" },
          ],
          documents: [],
          payments: [p],
          inspections: inspections.filter((i) => i.projectTitle === p.projectTitle),
          agreements: agreements.filter((a) => a.projectTitle === p.projectTitle),
        } as any);
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        linkedFiles: client.linkedFiles,
        createdAt: client.createdAt,
      },
      stats: {
        activeProjects: projectsWithDetails.length,
        totalContract,
        totalPaid,
        totalDue,
        inspectionCount: inspections.length,
      },
      projects: projectsWithDetails,
      payments,
      inspections,
      agreements,
    });
  } catch (error: any) {
    console.error("Client Me Error:", error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
