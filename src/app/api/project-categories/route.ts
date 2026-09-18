import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProjectCategory from "@/models/project-category.model";
import Project from "@/models/project.model";

const DEFAULT_CATEGORIES = [
  { name: "2D Plans", slug: "2d-plan", description: "2D আর্কিটেকচারাল ও স্ট্রাকচারাল ফ্লোর প্ল্যান", order: 1, isDefault: true },
  { name: "3D Exterior", slug: "3d-exterior", description: "বিল্ডিং ৩ডি এক্সটেরিয়র ডিজাইন ও এলিভেশন", order: 2, isDefault: true },
  { name: "3D Interior", slug: "3d-interior", description: "আধুনিক ৩ডি ইন্টেরিয়র ও রুম ডিজাইন", order: 3, isDefault: true },
  { name: "Construction Sites", slug: "construction", description: "সাইট নির্মাণ ও সুপারভিশন প্রজেক্ট", order: 4, isDefault: true },
];

export async function GET() {
  try {
    await dbConnect();

    const count = await ProjectCategory.countDocuments();
    if (count === 0) {
      for (const item of DEFAULT_CATEGORIES) {
        await ProjectCategory.create(item);
      }
    }

    const categories = await ProjectCategory.find().sort({ order: 1, createdAt: 1 }).lean();

    // Attach active project count for published projects
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const publishedCount = await Project.countDocuments({
          category: cat.slug,
          status: "published",
        });
        return {
          ...cat,
          projectCount: publishedCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: categoriesWithCount });
  } catch (error: any) {
    console.error("Public project categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
