import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/blog.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { logAction } from "@/lib/activity-log";
import { hasPermission } from "@/lib/permissions";
import { z } from "zod";

const CreateBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional().default([]),
  coverImage: z
    .object({ url: z.string().optional(), publicId: z.string().optional() })
    .optional(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
});

const UpdateBlogSchema = z.object({
  _id: z.string().min(1),
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z
    .object({ url: z.string().optional(), publicId: z.string().optional() })
    .optional(),
  status: z.enum(["draft", "published"]).optional(),
});

const DeleteBlogSchema = z.object({
  _id: z.string().min(1),
});

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageBlog")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find({}).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments({}),
    ]);

    return NextResponse.json({
      blogs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageBlog")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const parsed = CreateBlogSchema.parse(body);
    const slug = slugify(parsed.title);

    const existingSlug = await Blog.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json({ error: "A blog with this slug already exists" }, { status: 409 });
    }

    const blogData: Record<string, unknown> = {
      ...parsed,
      slug,
    };
    if (parsed.status === "published") {
      blogData.publishedAt = new Date();
    }

    const blog = await Blog.create(blogData);
    await logAction("create_blog", "Blog", (payload as any).email, blog.title, blog._id.toString());
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create blog" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageBlog")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const parsed = UpdateBlogSchema.parse(body);
    const { _id, ...updates } = parsed;

    const existing = await Blog.findById(_id);
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const setFields: Record<string, unknown> = { ...updates };
    if (updates.title && updates.title !== existing.title) {
      setFields.slug = slugify(updates.title);
    }

    if (updates.status === "published" && existing.status !== "published") {
      setFields.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(_id, setFields, { new: true, runValidators: true });
    await logAction("update_blog", "Blog", (payload as any).email, `Updated: ${updates.title || existing.title}`, _id);
    return NextResponse.json({ blog });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageBlog")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const parsed = DeleteBlogSchema.parse(body);

    const deletedBlog = await Blog.findByIdAndDelete(parsed._id);
    await logAction("delete_blog", "Blog", (payload as any).email, `Deleted: ${deletedBlog?.title || parsed._id}`, parsed._id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to delete blog" }, { status: 500 });
  }
}
