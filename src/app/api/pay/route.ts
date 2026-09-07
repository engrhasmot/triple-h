import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PaymentSubmission from "@/models/payment-submission.model";
import { sendWhatsApp, newPaymentSubmissionWhatsApp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientName,
      phone,
      planFileRef,
      projectTitle,
      amount,
      method,
      senderPhone,
      transactionId,
      note,
    } = body;

    if (!clientName || !phone || !amount || !method || !senderPhone || !transactionId) {
      return NextResponse.json(
        { error: "Please provide all required fields including Transaction ID (TrxID)" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    await dbConnect();

    // Prevent immediate duplicate submissions
    const existing = await PaymentSubmission.findOne({
      transactionId: transactionId.trim().toUpperCase(),
    });
    if (existing) {
      return NextResponse.json(
        { error: "This Transaction ID (TrxID) has already been submitted for verification." },
        { status: 409 }
      );
    }

    const submission = await PaymentSubmission.create({
      clientName: clientName.trim(),
      phone: phone.trim(),
      planFileRef: planFileRef ? planFileRef.trim().toUpperCase() : undefined,
      projectTitle: projectTitle ? projectTitle.trim() : undefined,
      amount: parsedAmount,
      method: method.toLowerCase(),
      senderPhone: senderPhone.trim(),
      transactionId: transactionId.trim().toUpperCase(),
      note: note ? note.trim() : undefined,
      status: "pending",
    });

    // Notify Admin via WhatsApp in background
    try {
      sendWhatsApp(
        newPaymentSubmissionWhatsApp({
          clientName: submission.clientName,
          phone: submission.phone,
          amount: submission.amount,
          method: submission.method,
          senderPhone: submission.senderPhone,
          transactionId: submission.transactionId,
          projectTitle: submission.projectTitle,
          planFileRef: submission.planFileRef,
        })
      ).catch((err) => console.error("[WhatsApp] Failed to send payment submission alert:", err));
    } catch (waErr) {
      console.error("[WhatsApp Error]:", waErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment submitted successfully for verification!",
        submission: {
          id: submission._id,
          transactionId: submission.transactionId,
          amount: submission.amount,
          status: submission.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Pay API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit payment" }, { status: 500 });
  }
}
