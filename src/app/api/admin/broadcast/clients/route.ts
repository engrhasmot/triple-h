import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/payment.model";
import WorkOrder from "@/models/work-order.model";
import Inquiry from "@/models/inquiry.model";
import PlanStatus from "@/models/plan-status.model";
import ClientUser from "@/models/client-user.model";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  if (!hasPermission((payload as any).role, "canManageInquiries") && !hasPermission((payload as any).role, "canManagePayments")) {
    return null;
  }
  return payload;
}

export async function GET(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    // Fetch from ClientUser, PlanStatus, Payment, WorkOrder, Inquiry
    const [clientUsers, planFiles, payments, workOrders, inquiries] = await Promise.all([
      ClientUser.find({}, "name phone address linkedFiles").lean(),
      PlanStatus.find({}, "clientName phone projectTitle currentStatus").lean(),
      Payment.find({}, "clientName phone projectTitle status dueAmount").lean(),
      WorkOrder.find({}, "name phone projectTitle status").lean(),
      Inquiry.find({}, "name phone serviceType status").lean(),
    ]);

    // Unique by phone
    const clientMap = new Map<string, {
      name: string;
      phone: string;
      projectTitle?: string;
      source: string;
      status?: string;
      hasDue?: boolean;
    }>();

    for (const u of clientUsers) {
      if (u.phone) {
        const cleanPhone = u.phone.trim().replace(/[^\d+]/g, "");
        if (cleanPhone.length >= 10 && !clientMap.has(cleanPhone)) {
          clientMap.set(cleanPhone, {
            name: u.name || "সম্মানিত ক্লায়েন্ট",
            phone: cleanPhone,
            projectTitle: u.linkedFiles?.length > 0 ? `File: ${u.linkedFiles.join(", ")}` : "Portal Client",
            source: "Registered Client",
            status: "active",
            hasDue: false,
          });
        }
      }
    }

    for (const pl of planFiles) {
      if (pl.phone) {
        const cleanPhone = pl.phone.trim().replace(/[^\d+]/g, "");
        if (cleanPhone.length >= 10 && !clientMap.has(cleanPhone)) {
          clientMap.set(cleanPhone, {
            name: pl.clientName || "সম্মানিত ক্লায়েন্ট",
            phone: cleanPhone,
            projectTitle: pl.projectTitle,
            source: "Plan Tracker",
            status: pl.currentStatus,
            hasDue: false,
          });
        }
      }
    }

    for (const p of payments) {
      if (p.phone) {
        const cleanPhone = p.phone.trim().replace(/[^\d+]/g, "");
        if (cleanPhone.length >= 10 && !clientMap.has(cleanPhone)) {
          clientMap.set(cleanPhone, {
            name: p.clientName || "সম্মানিত ক্লায়েন্ট",
            phone: cleanPhone,
            projectTitle: p.projectTitle,
            source: "Payment/Client",
            status: p.status,
            hasDue: (p.dueAmount || 0) > 0,
          });
        }
      }
    }

    for (const w of workOrders) {
      if (w.phone) {
        const cleanPhone = w.phone.trim().replace(/[^\d+]/g, "");
        if (cleanPhone.length >= 10 && !clientMap.has(cleanPhone)) {
          clientMap.set(cleanPhone, {
            name: w.name || "সম্মানিত ক্লায়েন্ট",
            phone: cleanPhone,
            projectTitle: w.projectTitle,
            source: "Work Order",
            status: w.status,
            hasDue: false,
          });
        }
      }
    }

    for (const i of inquiries) {
      if (i.phone) {
        const cleanPhone = i.phone.trim().replace(/[^\d+]/g, "");
        if (cleanPhone.length >= 10 && !clientMap.has(cleanPhone)) {
          clientMap.set(cleanPhone, {
            name: i.name || "সম্মানিত ক্লায়েন্ট",
            phone: cleanPhone,
            projectTitle: i.serviceType ? `${i.serviceType} Inquiry` : undefined,
            source: "Inquiry",
            status: i.status,
            hasDue: false,
          });
        }
      }
    }

    const clientList = Array.from(clientMap.values());

    return NextResponse.json({
      success: true,
      total: clientList.length,
      clients: clientList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch clients" }, { status: 500 });
  }
}
