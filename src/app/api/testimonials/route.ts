import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Testimonial from "@/models/testimonial.model";

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ data: testimonials }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
