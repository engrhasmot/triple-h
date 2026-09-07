import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Testimonial from "@/models/testimonial.model";
import { sendWhatsApp, newReviewAdminWhatsApp } from "@/lib/whatsapp";

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json({ data: testimonials }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, designation, company, content, rating } = body;

    if (!clientName || !content || rating === undefined) {
      return NextResponse.json(
        { error: "Name, rating, and review text are required" },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 stars" },
        { status: 400 }
      );
    }

    await dbConnect();

    const testimonial = await Testimonial.create({
      clientName: clientName.trim(),
      designation: designation?.trim() || undefined,
      company: company?.trim() || undefined,
      content: content.trim(),
      rating: numRating,
      isActive: false, // Requires admin approval before showing on live site
      isFeatured: false,
    });

    // Alert admin on WhatsApp
    sendWhatsApp(
      newReviewAdminWhatsApp({
        clientName: testimonial.clientName,
        rating: testimonial.rating,
        content: testimonial.content,
        designation: testimonial.designation,
      })
    ).catch((err) => console.error("[WhatsApp] New review alert failed:", err));

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your review has been submitted and will appear once approved.",
        data: { id: testimonial._id },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
