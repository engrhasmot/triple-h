import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import ClientUser from "@/models/client-user.model";
import { verifyClientToken } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("client_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।" }, { status: 401 });
    }

    const payload: any = await verifyClientToken(token);
    if (!payload?.clientId) {
      return NextResponse.json({ error: "মেয়াদোত্তীর্ণ সেশন" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, address, currentPassword, newPassword, newFileId } = body;

    await dbConnect();

    const client = await ClientUser.findById(payload.clientId).select("+password");
    if (!client) {
      return NextResponse.json({ error: "ব্যবহারকারী পাওয়া যায়নি" }, { status: 404 });
    }

    if (name?.trim()) client.name = name.trim();
    if (email !== undefined) client.email = email.trim().toLowerCase();
    if (address !== undefined) client.address = address.trim();

    // If client wants to link a new file ID
    if (newFileId?.trim()) {
      const cleanFile = newFileId.trim().toUpperCase();
      if (!client.linkedFiles.includes(cleanFile)) {
        client.linkedFiles.push(cleanFile);
      }
    }

    // Password change logic
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "বর্তমান পাসওয়ার্ড দিন" }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, client.password);
      if (!isMatch) {
        return NextResponse.json({ error: "বর্তমান পাসওয়ার্ডটি সঠিক নয়" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" }, { status: 400 });
      }

      client.password = await bcrypt.hash(newPassword, 10);
    }

    await client.save();

    return NextResponse.json({
      success: true,
      message: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে",
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
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: error?.message || "প্রোফাইল আপডেটে সমস্যা হয়েছে" }, { status: 500 });
  }
}
