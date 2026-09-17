import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import ClientUser from "@/models/client-user.model";
import PlanStatus from "@/models/plan-status.model";
import Payment from "@/models/payment.model";
import { signClientToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, password, email, address, fileId } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "আপনার পুরো নাম লিখুন" }, { status: 400 });
    }

    if (!phone?.trim()) {
      return NextResponse.json({ error: "সঠিক মোবাইল নম্বর লিখুন" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" }, { status: 400 });
    }

    // Standardize phone number (Bangladeshi 01XXXXXXXXX)
    const cleanPhone = phone.replace(/[+\s-]/g, "").replace(/^880/, "0");
    if (!/^01\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)" }, { status: 400 });
    }

    await dbConnect();

    // Check if account already exists
    const existing = await ClientUser.findOne({ phone: cleanPhone });
    if (existing) {
      return NextResponse.json(
        { error: "এই মোবাইল নম্বর দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন।" },
        { status: 409 }
      );
    }

    // Auto-discover linked project files from existing PlanStatus and Payment records
    const matchedFiles = new Set<string>();
    if (fileId?.trim()) {
      matchedFiles.add(fileId.trim().toUpperCase());
    }

    const [existingPlans, existingPayments] = await Promise.all([
      PlanStatus.find({
        $or: [
          { phone: { $regex: cleanPhone, $options: "i" } },
          { phone: { $regex: phone.trim(), $options: "i" } },
        ],
      })
        .select("fileId")
        .lean(),
      Payment.find({
        $or: [
          { phone: { $regex: cleanPhone, $options: "i" } },
          { phone: { $regex: phone.trim(), $options: "i" } },
        ],
      })
        .select("planFileRef")
        .lean(),
    ]);

    existingPlans.forEach((p: any) => {
      if (p.fileId) matchedFiles.add(p.fileId.toUpperCase());
    });
    existingPayments.forEach((pay: any) => {
      if (pay.planFileRef) matchedFiles.add(pay.planFileRef.toUpperCase());
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = await ClientUser.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim()?.toLowerCase() || "",
      password: hashedPassword,
      address: address?.trim() || "",
      linkedFiles: Array.from(matchedFiles),
      isActive: true,
      isVerified: true,
      lastLogin: new Date(),
    });

    const token = await signClientToken({
      clientId: newClient._id.toString(),
      phone: newClient.phone,
      name: newClient.name,
    });

    const cookieStore = await cookies();
    cookieStore.set("client_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      message: "রেজিস্ট্রেশন সফল হয়েছে!",
      user: {
        id: newClient._id,
        name: newClient.name,
        phone: newClient.phone,
        email: newClient.email,
        address: newClient.address,
        linkedFiles: newClient.linkedFiles,
      },
    });
  } catch (error: any) {
    console.error("Client Register Error:", error);
    return NextResponse.json({ error: error?.message || "রেজিস্ট্রেশনে সমস্যা হয়েছে" }, { status: 500 });
  }
}
