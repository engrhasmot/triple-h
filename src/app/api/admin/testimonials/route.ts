import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Testimonial from "@/models/testimonial.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { logAction } from "@/lib/activity-log";
import { hasPermission } from "@/lib/permissions";

async function authenticate(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTestimonials")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const testimonials = await Testimonial.find().sort({ isFeatured: -1, order: 1 }).lean();
    return NextResponse.json({ data: testimonials }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTestimonials")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    if (!body.clientName || !body.content || !body.rating) {
      return NextResponse.json({ error: "clientName, content, and rating are required" }, { status: 400 });
    }
    const testimonial = await Testimonial.create({
      clientName: body.clientName,
      designation: body.designation,
      company: body.company,
      content: body.content,
      rating: body.rating,
      avatar: body.avatar || undefined,
      projectImage: body.projectImage || undefined,
      isFeatured: body.isFeatured ?? false,
      order: body.order ?? 0,
      isActive: body.isActive ?? true,
    });
    await logAction("create_testimonial", "Testimonial", (session as any).email, `Created: ${testimonial.clientName}`, testimonial._id.toString());
    return NextResponse.json({ data: testimonial }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create testimonial" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTestimonials")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;
    if (!_id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }
    const testimonial = await Testimonial.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    await logAction("update_testimonial", "Testimonial", (session as any).email, `Updated: ${testimonial.clientName}`, _id);
    return NextResponse.json({ data: testimonial }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageTestimonials")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    if (!body._id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }
    const testimonial = await Testimonial.findByIdAndDelete(body._id);
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    await logAction("delete_testimonial", "Testimonial", (session as any).email, `Deleted: ${testimonial.clientName}`, body._id);
    return NextResponse.json({ message: "Testimonial deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
