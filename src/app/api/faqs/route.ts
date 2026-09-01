import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Faq from "@/models/faq.model";

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    const faqs = await Faq.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const grouped: Record<string, typeof faqs> = {};
    for (const faq of faqs) {
      const cat = faq.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(faq);
    }

    const categories = Object.keys(grouped);
    const data = categories.map((category) => ({
      category,
      items: grouped[category],
    }));

    return NextResponse.json({ categories, faqs: data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}
