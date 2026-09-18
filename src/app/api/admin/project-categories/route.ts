import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProjectCategory from "@/models/project-category.model";
import Project from "@/models/project.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { logAction } from "@/lib/activity-log";
import { hasPermission } from "@/lib/permissions";

const DEFAULT_CATEGORIES = [
  { name: "2D Plans", slug: "2d-plan", description: "2D আর্কিটেকচারাল ও স্ট্রাকচারাল ফ্লোর প্ল্যান", order: 1, isDefault: true },
  { name: "3D Exterior", slug: "3d-exterior", description: "বিল্ডিং ৩ডি এক্সটেরিয়র ডিজাইন ও এলিভেশন", order: 2, isDefault: true },
  { name: "3D Interior", slug: "3d-interior", description: "আধুনিক ৩ডি ইন্টেরিয়র ও রুম ডিজাইন", order: 3, isDefault: true },
  { name: "Construction Sites", slug: "construction", description: "সাইট নির্মাণ ও সুপারভিশন প্রজেক্ট", order: 4, isDefault: true },
];

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0980-\u09FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();

    // Auto-seed if empty
    const count = await ProjectCategory.countDocuments();
    if (count === 0) {
      for (const item of DEFAULT_CATEGORIES) {
        await ProjectCategory.create(item);
      }
    }

    const categories = await ProjectCategory.find().sort({ order: 1, createdAt: 1 }).lean();

    // Attach project counts to each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const projectCount = await Project.countDocuments({ category: cat.slug });
        return {
          ...cat,
          projectCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: categoriesWithCount });
  } catch (error: any) {
    console.error("Project categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, order } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "ক্যাটাগরির নাম আবশ্যক" }, { status: 400 });
    }

    await dbConnect();

    const cleanSlug = body.slug ? slugify(body.slug) : slugify(name);
    if (!cleanSlug) {
      return NextResponse.json({ error: "সঠিক স্লাগ তৈরি করা সম্ভব হয়নি" }, { status: 400 });
    }

    // Check duplicate
    const existing = await ProjectCategory.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json({ error: `"${cleanSlug}" স্লাগের একটি ক্যাটাগরি ইতিমধ্যে রয়েছে` }, { status: 400 });
    }

    const maxOrder = await ProjectCategory.findOne().sort({ order: -1 }).select("order").lean();
    const finalOrder = order !== undefined ? Number(order) : (maxOrder?.order ? maxOrder.order + 1 : 1);

    const newCategory = await ProjectCategory.create({
      name: name.trim(),
      slug: cleanSlug,
      description: description?.trim() || "",
      order: finalOrder,
      isDefault: false,
    });

    await logAction(
      "create_project_category" as any,
      "ProjectCategory",
      (payload as any).email,
      `Created category: ${newCategory.name}`,
      newCategory._id.toString()
    );

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error: any) {
    console.error("Project category POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, slug, description, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ক্যাটাগরি আইডি আবশ্যক" }, { status: 400 });
    }

    await dbConnect();
    const category = await ProjectCategory.findById(id);
    if (!category) {
      return NextResponse.json({ error: "ক্যাটাগরি পাওয়া যায়নি" }, { status: 404 });
    }

    const oldSlug = category.slug;
    let newSlug = oldSlug;

    if (slug && slugify(slug) !== oldSlug) {
      newSlug = slugify(slug);
      const duplicate = await ProjectCategory.findOne({ slug: newSlug, _id: { $ne: id } });
      if (duplicate) {
        return NextResponse.json({ error: `"${newSlug}" স্লাগটি অন্য ক্যাটাগরিতে ব্যবহৃত হয়েছে` }, { status: 400 });
      }
      category.slug = newSlug;
    }

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (order !== undefined) category.order = Number(order);

    await category.save();

    // If slug changed, update all projects with oldSlug to newSlug
    if (newSlug !== oldSlug) {
      await Project.updateMany({ category: oldSlug }, { category: newSlug });
    }

    await logAction(
      "update_project_category" as any,
      "ProjectCategory",
      (payload as any).email,
      `Updated category: ${category.name}`,
      id
    );

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error("Project category PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageProjects")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!id) {
      return NextResponse.json({ error: "ক্যাটাগরি আইডি আবশ্যক" }, { status: 400 });
    }

    await dbConnect();
    const category = await ProjectCategory.findById(id);
    if (!category) {
      return NextResponse.json({ error: "ক্যাটাগরি পাওয়া যায়নি" }, { status: 404 });
    }

    const projectCount = await Project.countDocuments({ category: category.slug });
    if (projectCount > 0 && !force) {
      return NextResponse.json(
        {
          error: `এই ক্যাটাগরির অধীনে ${projectCount} টি প্রজেক্ট রয়েছে। প্রথমে প্রজেক্টগুলোর ক্যাটাগরি পরিবর্তন করুন অথবা ফোর্স ডিলিট নিশ্চিত করুন।`,
          hasProjects: true,
          projectCount,
        },
        { status: 400 }
      );
    }

    // If forced delete, reassign projects to first available category or uncategorized
    if (projectCount > 0 && force) {
      const fallbackCat = await ProjectCategory.findOne({ _id: { $ne: id } }).sort({ order: 1 });
      const fallbackSlug = fallbackCat?.slug || "uncategorized";
      await Project.updateMany({ category: category.slug }, { category: fallbackSlug });
    }

    await ProjectCategory.findByIdAndDelete(id);

    await logAction(
      "delete_project_category" as any,
      "ProjectCategory",
      (payload as any).email,
      `Deleted category: ${category.name}`,
      id
    );

    return NextResponse.json({ success: true, message: "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে" });
  } catch (error: any) {
    console.error("Project category DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
