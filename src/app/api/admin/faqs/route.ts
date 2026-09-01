import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Faq from "@/models/faq.model";
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
  if (!hasPermission((session as any).role, "canManageFaqs")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const faqs = await Faq.find().sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ data: faqs }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageFaqs")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    if (!body.question || !body.answer || !body.category) {
      return NextResponse.json({ error: "question, answer, and category are required" }, { status: 400 });
    }
    const faq = await Faq.create({
      question: body.question,
      answer: body.answer,
      category: body.category,
      order: body.order ?? 0,
      isPublished: body.isPublished ?? true,
    });
    await logAction("create_faq", "FAQ", (session as any).email, `Created: ${faq.question}`, faq._id.toString());
    return NextResponse.json({ data: faq }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create FAQ" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageFaqs")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;
    if (!_id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }
    const faq = await Faq.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    await logAction("update_faq", "FAQ", (session as any).email, `Updated: ${faq.question}`, _id);
    return NextResponse.json({ data: faq }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission((session as any).role, "canManageFaqs")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    if (!body._id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }
    const faq = await Faq.findByIdAndDelete(body._id);
    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    await logAction("delete_faq", "FAQ", (session as any).email, `Deleted: ${faq.question}`, body._id);
    return NextResponse.json({ message: "FAQ deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
