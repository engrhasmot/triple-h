import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Inquiry from "@/models/inquiry.model";
import Appointment from "@/models/appointment.model";
import WorkOrder from "@/models/work-order.model";
import Testimonial from "@/models/testimonial.model";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const [newInquiries, pendingAppointments, pendingWorkOrders, pendingTestimonials] =
      await Promise.all([
        Inquiry.countDocuments({ status: "new" }),
        Appointment.countDocuments({ status: "pending" }),
        WorkOrder.countDocuments({ status: "pending" }),
        Testimonial.countDocuments({ isActive: false }),
      ]);

    return NextResponse.json({
      success: true,
      counts: {
        "/admin/inquiries": newInquiries,
        "/admin/site-visits": pendingAppointments,
        "/admin/work-orders": pendingWorkOrders,
        "/admin/testimonials": pendingTestimonials,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}
