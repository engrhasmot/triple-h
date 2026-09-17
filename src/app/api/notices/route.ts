import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notice from "@/models/notice.model";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const audience = searchParams.get("audience"); // "all" or "clients_only"

    await dbConnect();

    const query: Record<string, any> = { isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (audience === "public") {
      query.targetAudience = "all";
    }

    const notices = await Notice.find(query)
      .sort({ isPinned: -1, publishedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      total: notices.length,
      notices,
    });
  } catch (error: any) {
    console.error("Fetch Notices Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load notices" },
      { status: 500 }
    );
  }
}
