import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PaymentSubmission from "@/models/payment-submission.model";
import Payment from "@/models/payment.model";
import ActivityLog from "@/models/activity-log.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { sendWhatsApp, paymentReceiptWhatsApp } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    const filter: Record<string, any> = {};
    if (status !== "all") filter.status = status;

    const submissions = await PaymentSubmission.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, submissions });
  } catch (error: any) {
    console.error("Submissions GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const body = await req.json();
    const { id, action, adminNote } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Submission ID and action are required" }, { status: 400 });
    }

    const sub = await PaymentSubmission.findById(id);
    if (!sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const reviewer = (payload as any).email || "admin";

    if (action === "approve") {
      sub.status = "approved";
      sub.reviewedBy = reviewer;
      sub.reviewedAt = new Date();
      sub.adminNote = adminNote || undefined;
      await sub.save();

      // Find or match Payment record to update
      const cleanPhone = sub.phone.replace(/[+\s-]/g, "").replace(/^880/, "0");
      let payment = await Payment.findOne({
        $or: [
          { planFileRef: sub.planFileRef ? sub.planFileRef : null },
          { phone: { $regex: cleanPhone, $options: "i" } },
        ],
      });

      const newInstallment = {
        type: "other" as const,
        label: `Online ${sub.method.toUpperCase()} (TrxID: ${sub.transactionId})`,
        amount: sub.amount,
        paidOn: new Date(),
        note: sub.note || `Verified via Online Portal from ${sub.senderPhone}`,
        receivedBy: reviewer,
      };

      if (!payment) {
        // Create new Payment record if not exists
        payment = await Payment.create({
          clientName: sub.clientName,
          phone: sub.phone,
          projectTitle: sub.projectTitle || "Consultancy Project",
          serviceType: "Consultation & Design",
          totalAmount: sub.amount,
          paidAmount: sub.amount,
          dueAmount: 0,
          status: "paid",
          installments: [newInstallment],
          planFileRef: sub.planFileRef,
        });
      } else {
        payment.installments.push(newInstallment);
        payment.paidAmount = (payment.paidAmount || 0) + sub.amount;
        payment.dueAmount = Math.max(0, (payment.totalAmount || 0) - payment.paidAmount);
        payment.status = payment.dueAmount === 0 ? "paid" : "partial";
        await payment.save();
      }

      // Send WhatsApp Money Receipt to Client
      try {
        sendWhatsApp(
          paymentReceiptWhatsApp({
            clientName: payment.clientName,
            projectTitle: payment.projectTitle,
            installmentAmount: sub.amount,
            installmentType: sub.method.toUpperCase(),
            totalAmount: payment.totalAmount,
            totalPaid: payment.paidAmount,
            dueAmount: payment.dueAmount,
            note: `TrxID: ${sub.transactionId}`,
          }),
          payment.phone
        ).catch((err) => console.error("[WhatsApp] Failed to send receipt:", err));
      } catch (waErr) {
        console.error("[WhatsApp Receipt Error]:", waErr);
      }

      // Log Activity
      try {
        await ActivityLog.create({
          action: "UPDATE",
          resource: "PaymentSubmission",
          resourceId: sub._id.toString(),
          performedBy: reviewer,
          details: `Approved online payment of ৳${sub.amount} (TrxID: ${sub.transactionId}) for ${sub.clientName}`,
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Payment approved, ledger updated, and WhatsApp receipt sent!",
      });
    } else if (action === "reject") {
      sub.status = "rejected";
      sub.reviewedBy = reviewer;
      sub.reviewedAt = new Date();
      sub.adminNote = adminNote || "Invalid or unverified transaction";
      await sub.save();

      try {
        await ActivityLog.create({
          action: "UPDATE",
          resource: "PaymentSubmission",
          resourceId: sub._id.toString(),
          performedBy: reviewer,
          details: `Rejected payment submission (TrxID: ${sub.transactionId}) for ${sub.clientName}`,
        });
      } catch {}

      return NextResponse.json({ success: true, message: "Payment submission rejected." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Submissions PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process submission" }, { status: 500 });
  }
}
