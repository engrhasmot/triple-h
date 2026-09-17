import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import ClientUser from "@/models/client-user.model";
import { signClientToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier?.trim() || !password) {
      return NextResponse.json({ error: "মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড দিন" }, { status: 400 });
    }

    await dbConnect();

    const cleanInput = identifier.trim();
    const cleanPhone = cleanInput.replace(/[+\s-]/g, "").replace(/^880/, "0");

    // Search by phone or email
    const client = await ClientUser.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: cleanInput },
        { email: cleanInput.toLowerCase() },
      ],
    }).select("+password");

    if (!client) {
      return NextResponse.json({ error: "মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়" }, { status: 401 });
    }

    if (!client.isActive) {
      return NextResponse.json({ error: "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। সাপোর্টে যোগাযোগ করুন।" }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return NextResponse.json({ error: "মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়" }, { status: 401 });
    }

    client.lastLogin = new Date();
    await client.save();

    const token = await signClientToken({
      clientId: client._id.toString(),
      phone: client.phone,
      name: client.name,
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
      message: "সফলভাবে লগইন হয়েছে!",
      user: {
        id: client._id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        linkedFiles: client.linkedFiles,
      },
    });
  } catch (error: any) {
    console.error("Client Login Error:", error);
    return NextResponse.json({ error: error?.message || "লগইনে সমস্যা হয়েছে" }, { status: 500 });
  }
}
