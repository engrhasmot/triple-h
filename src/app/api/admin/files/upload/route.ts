import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import dbConnect from "@/lib/db";
import PlanStatus from "@/models/plan-status.model";
import cloudinary from "@/lib/cloudinary";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25 MB

async function checkAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

function uploadBufferToCloudinary(buffer: Buffer, folder: string, filename: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: filename.replace(/\.[^/.]+$/, ""),
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageFiles")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const planId = formData.get("planId") as string | null;
    const customName = formData.get("customName") as string | null;
    const file = formData.get("file") as File | null;

    if (!planId) {
      return NextResponse.json({ error: "প্ল্যান আইডি (planId) প্রদান করা আবশ্যক" }, { status: 400 });
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "কোনো PDF ফাইল নির্বাচন করা হয়নি" }, { status: 400 });
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { error: "ফাইলের সাইজ অনেক বড়। সর্বোচ্চ ২৫ মেগাবাইট (25 MB) পর্যন্ত ফাইল আপলোড করা যাবে।" },
        { status: 400 }
      );
    }

    const isPdfMime = file.type === "application/pdf";
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfMime && !isPdfExt) {
      return NextResponse.json(
        { error: "শুধুমাত্র PDF ফাইল (.pdf) আপলোড করা যাবে।" },
        { status: 400 }
      );
    }

    await dbConnect();
    const plan = await PlanStatus.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: "প্ল্যান ফাইলটি খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate PDF magic bytes (%PDF)
    const header = buffer.subarray(0, 4).toString("utf-8");
    if (header !== "%PDF") {
      return NextResponse.json(
        { error: "ফাইলটি সঠিক PDF ফরম্যাটের নয়। অনুগ্রহ করে আসল PDF ফাইল আপলোড করুন।" },
        { status: 400 }
      );
    }

    let fileUrl = "";
    let publicId = "";

    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinary) {
      try {
        const cleanBaseName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const cRes = await uploadBufferToCloudinary(
          buffer,
          "triple-h/plan-documents",
          `${plan.fileId || "doc"}-${Date.now()}-${cleanBaseName}`
        );
        fileUrl = cRes.secure_url || cRes.url;
        publicId = cRes.public_id;
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local disk storage:", cloudErr);
      }
    }

    // Fallback or default to local storage
    if (!fileUrl) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "plans");
      await fs.mkdir(uploadDir, { recursive: true });

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const safeFileName = `${plan.fileId || "plan"}-${Date.now()}-${cleanFileName}`;
      const filePath = path.join(uploadDir, safeFileName);

      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/plans/${safeFileName}`;
      publicId = `local-${safeFileName}`;
    }

    const docTitle = customName?.trim() || file.name.replace(/\.[^/.]+$/, "") || "Plan Document";

    const newDoc = {
      name: docTitle,
      url: fileUrl,
      publicId: publicId || `doc-${Date.now()}`,
      sizeBytes: file.size,
      fileType: "application/pdf",
      uploadedAt: new Date(),
    };

    plan.documents.push(newDoc as any);
    await plan.save();

    return NextResponse.json({
      success: true,
      message: "PDF ফাইল সফলভাবে আপলোড করা হয়েছে",
      data: newDoc,
      documents: plan.documents,
    });
  } catch (error: any) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { error: error.message || "PDF ফাইল আপলোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const payload = await checkAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canManageFiles")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("planId");
    const publicId = searchParams.get("publicId");
    const url = searchParams.get("url");

    if (!planId || (!publicId && !url)) {
      return NextResponse.json(
        { error: "planId এবং publicId বা url প্রদান করা আবশ্যক" },
        { status: 400 }
      );
    }

    await dbConnect();
    const plan = await PlanStatus.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: "প্ল্যান খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    const docIndex = plan.documents.findIndex(
      (d: any) => (publicId && d.publicId === publicId) || (url && d.url === url)
    );

    if (docIndex === -1) {
      return NextResponse.json({ error: "ডকুমেন্টটি খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    const docToDelete = plan.documents[docIndex];

    // Attempt to remove local file if stored locally
    if (docToDelete.publicId?.startsWith("local-") || docToDelete.url?.startsWith("/uploads/plans/")) {
      try {
        const localFileName = docToDelete.url.replace(/^\/uploads\/plans\//, "");
        const localPath = path.join(process.cwd(), "public", "uploads", "plans", localFileName);
        await fs.unlink(localPath);
      } catch (_unlinkErr) {
        // Ignore if file doesn't exist
      }
    } else if (
      docToDelete.publicId &&
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY
    ) {
      try {
        await cloudinary.uploader.destroy(docToDelete.publicId, { resource_type: "raw" });
      } catch (_cloudErr) {
        // Ignore cloudinary delete failures
      }
    }

    plan.documents.splice(docIndex, 1);
    await plan.save();

    return NextResponse.json({
      success: true,
      message: "ডকুমেন্টটি সফলভাবে মুছে ফেলা হয়েছে",
      documents: plan.documents,
    });
  } catch (error: any) {
    console.error("PDF delete error:", error);
    return NextResponse.json(
      { error: error.message || "ডকুমেন্ট মুছতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
