import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import ClientUser from "@/models/client-user.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { logAction } from "@/lib/activity-log";
import { hasPermission } from "@/lib/permissions";

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

function cleanBdPhone(phone: string): string {
  return phone.replace(/[+\s-]/g, "").replace(/^880/, "0");
}

export async function GET(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageUsers") && !hasPermission((payload as any).role, "canManageFiles")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status") || "all";

    await dbConnect();

    // Auto-backfill clientId for any existing clients that don't have one
    const clientsMissingId = await ClientUser.find({
      $or: [{ clientId: { $exists: false } }, { clientId: "" }, { clientId: null }],
    });
    if (clientsMissingId.length > 0) {
      const year = new Date().getFullYear();
      let startNum = 1;
      for (const c of clientsMissingId) {
        c.clientId = `CL-${year}-${String(startNum++).padStart(4, "0")}`;
        await c.save();
      }
    }

    const query: any = {};

    if (status === "active") {
      query.isActive = true;
    } else if (status === "suspended") {
      query.isActive = false;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { name: regex },
        { phone: regex },
        { email: regex },
        { clientId: regex },
        { linkedFiles: regex },
        { address: regex },
      ];
    }

    const [clients, totalCount, activeCount, suspendedCount] = await Promise.all([
      ClientUser.find(query).sort({ createdAt: -1 }).lean(),
      ClientUser.countDocuments(),
      ClientUser.countDocuments({ isActive: true }),
      ClientUser.countDocuments({ isActive: false }),
    ]);

    const totalLinkedFiles = clients.reduce((acc, c) => acc + (c.linkedFiles?.length || 0), 0);

    return NextResponse.json({
      success: true,
      data: clients,
      stats: {
        total: totalCount,
        active: activeCount,
        suspended: suspendedCount,
        linkedFilesCount: totalLinkedFiles,
      },
    });
  } catch (error: any) {
    console.error("Admin Clients GET Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageUsers") && !hasPermission((payload as any).role, "canManageFiles")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, phone, password, email, address, clientId, linkedFiles, isActive, isVerified } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "ক্লায়েন্টের নাম আবশ্যক" }, { status: 400 });
    }

    if (!phone?.trim()) {
      return NextResponse.json({ error: "মোবাইল নম্বর আবশ্যক" }, { status: 400 });
    }

    const cleanPhone = cleanBdPhone(phone);
    if (!/^01\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" }, { status: 400 });
    }

    await dbConnect();

    // Check duplicate phone
    const existingPhone = await ClientUser.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return NextResponse.json({ error: "এই মোবাইল নম্বর দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে" }, { status: 409 });
    }

    // Check duplicate clientId if provided
    let finalClientId = clientId?.trim()?.toUpperCase();
    if (finalClientId) {
      const existingId = await ClientUser.findOne({ clientId: finalClientId });
      if (existingId) {
        return NextResponse.json({ error: `Client ID "${finalClientId}" ইতোমধ্যে ব্যবহৃত হয়েছে` }, { status: 409 });
      }
    } else {
      const year = new Date().getFullYear();
      const count = (await ClientUser.countDocuments()) + 1;
      finalClientId = `CL-${year}-${String(count).padStart(4, "0")}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await ClientUser.create({
      clientId: finalClientId,
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim()?.toLowerCase() || "",
      password: hashedPassword,
      address: address?.trim() || "",
      linkedFiles: Array.isArray(linkedFiles) ? linkedFiles.map((f: string) => f.trim().toUpperCase()).filter(Boolean) : [],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
    });

    await logAction(
      "create_client_user" as any,
      "ClientUser",
      (payload as any).email,
      `Created client: ${client.name} (${client.clientId})`,
      client._id.toString()
    );

    return NextResponse.json({
      success: true,
      message: "ক্লায়েন্ট অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে",
      data: client,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Admin Client Create Error:", error);
    return NextResponse.json({ error: error?.message || "ক্লায়েন্ট তৈরিতে সমস্যা হয়েছে" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageUsers") && !hasPermission((payload as any).role, "canManageFiles")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, phone, password, email, address, clientId, linkedFiles, isActive, isVerified } = body;

    if (!id) {
      return NextResponse.json({ error: "ক্লায়েন্ট আইডি আবশ্যক" }, { status: 400 });
    }

    await dbConnect();
    const client = await ClientUser.findById(id).select("+password");
    if (!client) {
      return NextResponse.json({ error: "ক্লায়েন্ট খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    // If phone updated, validate and check uniqueness
    if (phone && phone.trim()) {
      const cleanPhone = cleanBdPhone(phone);
      if (!/^01\d{9}$/.test(cleanPhone)) {
        return NextResponse.json({ error: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)" }, { status: 400 });
      }
      if (cleanPhone !== client.phone) {
        const existing = await ClientUser.findOne({ phone: cleanPhone, _id: { $ne: id } });
        if (existing) {
          return NextResponse.json({ error: "এই মোবাইল নম্বরটি অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে" }, { status: 409 });
        }
        client.phone = cleanPhone;
      }
    }

    // If clientId updated, check uniqueness
    if (clientId && clientId.trim()) {
      const upperId = clientId.trim().toUpperCase();
      if (upperId !== client.clientId) {
        const existing = await ClientUser.findOne({ clientId: upperId, _id: { $ne: id } });
        if (existing) {
          return NextResponse.json({ error: `Client ID "${upperId}" অন্য ক্লায়েন্টের জন্য ব্যবহৃত হচ্ছে` }, { status: 409 });
        }
        client.clientId = upperId;
      }
    }

    if (name && name.trim()) client.name = name.trim();
    if (email !== undefined) client.email = email.trim().toLowerCase();
    if (address !== undefined) client.address = address.trim();
    if (isActive !== undefined) client.isActive = Boolean(isActive);
    if (isVerified !== undefined) client.isVerified = Boolean(isVerified);

    if (Array.isArray(linkedFiles)) {
      client.linkedFiles = linkedFiles.map((f: string) => f.trim().toUpperCase()).filter(Boolean);
    }

    // If password provided, rehash
    if (password && password.trim()) {
      if (password.length < 6) {
        return NextResponse.json({ error: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" }, { status: 400 });
      }
      client.password = await bcrypt.hash(password, 10);
    }

    await client.save();

    await logAction(
      "update_client_user" as any,
      "ClientUser",
      (payload as any).email,
      `Updated client: ${client.name} (${client.clientId || client.phone})`,
      id
    );

    const safeClient = await ClientUser.findById(id).lean();

    return NextResponse.json({
      success: true,
      message: "ক্লায়েন্টের তথ্য সফলভাবে আপডেট হয়েছে",
      data: safeClient,
    });
  } catch (error: any) {
    console.error("Admin Client Update Error:", error);
    return NextResponse.json({ error: error?.message || "ক্লায়েন্ট আপডেট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageUsers") && !hasPermission((payload as any).role, "canManageFiles")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ক্লায়েন্ট আইডি আবশ্যক" }, { status: 400 });
    }

    await dbConnect();
    const client = await ClientUser.findById(id);
    if (!client) {
      return NextResponse.json({ error: "ক্লায়েন্ট খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    await ClientUser.findByIdAndDelete(id);

    await logAction(
      "delete_client_user" as any,
      "ClientUser",
      (payload as any).email,
      `Deleted client: ${client.name} (${client.clientId || client.phone})`,
      id
    );

    return NextResponse.json({
      success: true,
      message: "ক্লায়েন্ট অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে",
    });
  } catch (error: any) {
    console.error("Admin Client Delete Error:", error);
    return NextResponse.json({ error: error?.message || "ক্লায়েন্ট মুছতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
