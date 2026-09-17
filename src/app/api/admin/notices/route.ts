import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notice from "@/models/notice.model";
import { checkAdmin } from "@/lib/auth-check";

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const notices = await Notice.find({}).sort({ isPinned: -1, publishedAt: -1 }).lean();

    const stats = {
      total: notices.length,
      active: notices.filter((n) => n.isActive).length,
      pinned: notices.filter((n) => n.isPinned).length,
      urgent: notices.filter((n) => n.priority === "urgent").length,
    };

    return NextResponse.json({ success: true, stats, notices });
  } catch (error: any) {
    console.error("Admin Get Notices Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, category, priority, targetAudience, isPinned, isActive, author } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    await dbConnect();

    const newNotice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      category: category || "general",
      priority: priority || "normal",
      targetAudience: targetAudience || "all",
      isPinned: Boolean(isPinned),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      publishedAt: new Date(),
      author: author?.trim() || "ইঞ্জিনিয়ার মোঃ হাসমত আলী",
    });

    return NextResponse.json({
      success: true,
      message: "নোটিশ সফলভাবে তৈরি হয়েছে",
      notice: newNotice,
    });
  } catch (error: any) {
    console.error("Admin Create Notice Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create notice" }, { status: 500 });
  }
}
