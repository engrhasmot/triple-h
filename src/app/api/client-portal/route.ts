import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PlanStatus from "@/models/plan-status.model";
import Payment from "@/models/payment.model";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").trim();

    if (!query) {
      return NextResponse.json({ error: "Please provide a phone number or File ID" }, { status: 400 });
    }

    await dbConnect();

    // Standardize query: could be a File ID (TH-...) or phone number
    const isFileId = /^TH-/i.test(query);
    const cleanPhone = query.replace(/[+\s-]/g, "").replace(/^880/, "0");

    let fileQuery: Record<string, any> = {};
    if (isFileId) {
      fileQuery = { fileId: query.toUpperCase() };
    } else {
      fileQuery = {
        $or: [
          { phone: { $regex: cleanPhone, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
          { fileId: query.toUpperCase() },
        ],
      };
    }

    const files = await PlanStatus.find(fileQuery).sort({ createdAt: -1 }).lean();

    if (!files || files.length === 0) {
      // Check if maybe there's a payment record matching this phone
      const payments = await Payment.find({
        $or: [
          { phone: { $regex: cleanPhone, $options: "i" } },
          { planFileRef: query.toUpperCase() },
        ],
      }).sort({ createdAt: -1 }).lean();

      if (payments && payments.length > 0) {
        return NextResponse.json({
          success: true,
          projects: payments.map((p) => ({
            fileId: p.planFileRef || "N/A",
            projectTitle: p.projectTitle,
            clientName: p.clientName,
            location: "Dhaka, Bangladesh",
            currentStatus: "in-progress",
            progressPercentage: p.paidAmount >= p.totalAmount ? 100 : Math.round((p.paidAmount / (p.totalAmount || 1)) * 100),
            milestones: [
              { title: "Project Inception & Consultation", status: "completed" },
              { title: "Design Drafting & Modeling", status: "in-progress" },
              { title: "Client Review & Finalization", status: "pending" },
            ],
            documents: [],
            payments: [p],
          })),
        });
      }

      return NextResponse.json(
        { error: "No project or plan record found matching your query. Please check your phone number or File ID." },
        { status: 404 }
      );
    }

    // For each file, lookup matching payments
    const projectsWithPayments = await Promise.all(
      files.map(async (file) => {
        const filePayments = await Payment.find({
          $or: [
            { planFileRef: file.fileId },
            { phone: file.phone },
          ],
        }).lean();

        return {
          ...file,
          payments: filePayments,
        };
      })
    );

    return NextResponse.json({
      success: true,
      projects: projectsWithPayments,
    });
  } catch (error: any) {
    console.error("Client Portal Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load client portal" }, { status: 500 });
  }
}
