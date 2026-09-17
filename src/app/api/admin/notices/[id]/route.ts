import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notice from "@/models/notice.model";
import { checkAdmin } from "@/lib/auth-check";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    const updated = await Notice.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "নোটিশ সফলভাবে আপডেট করা হয়েছে",
      notice: updated,
    });
  } catch (error: any) {
    console.error("Admin Update Notice Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update notice" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await dbConnect();

    const deleted = await Notice.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "নোটিশটি মুছে ফেলা হয়েছে",
    });
  } catch (error: any) {
    console.error("Admin Delete Notice Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete notice" }, { status: 500 });
  }
}
