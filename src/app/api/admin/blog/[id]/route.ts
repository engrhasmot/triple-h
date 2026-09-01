import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { logAction } from "@/lib/activity-log";
import { hasPermission } from "@/lib/permissions";

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

async function checkAuthAndPermission(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return null;
  if (!hasPermission((payload as any).role, "canManageBlog")) return { forbidden: true };
  return payload;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageBlog")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const blog = await Blog.findById(id).lean();
    if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    return NextResponse.json({ blog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch blog" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageBlog")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const existing = await Blog.findById(id);
    if (!existing) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    if (body.title && body.title !== existing.title) {
      body.slug = slugify(body.title);
    }

    if (body.status === "published" && existing.status !== "published") {
      body.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    await logAction("update_blog", "Blog", (payload as any).email, `Updated: ${body.title || existing.title}`, id);
    return NextResponse.json({ blog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageBlog")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    await logAction("delete_blog", "Blog", (payload as any).email, `Deleted: ${deletedBlog?.title || id}`, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete blog" }, { status: 500 });
  }
}
