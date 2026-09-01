import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TeamMember from "@/models/team-member.model";

export async function GET() {
  try {
    await dbConnect();
    const members = await TeamMember.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    return NextResponse.json({ data: members }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}
