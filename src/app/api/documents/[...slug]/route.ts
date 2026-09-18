import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PlanDocumentFile from "@/models/plan-document-file.model";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return NextResponse.json({ error: "ডকুমেন্ট আইডি পাওয়া যায়নি" }, { status: 400 });
    }

    const fileIdOrName = slug[0];
    await dbConnect();

    let docFile = null;
    if (mongoose.Types.ObjectId.isValid(fileIdOrName)) {
      docFile = await PlanDocumentFile.findById(fileIdOrName);
    }

    if (!docFile) {
      docFile = await PlanDocumentFile.findOne({
        $or: [
          { filename: fileIdOrName },
          { fileId: fileIdOrName },
        ],
      });
    }

    if (!docFile || !docFile.data) {
      return new NextResponse("ডকুমেন্টটি খুঁজে পাওয়া যায়নি (File Not Found)", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const filename = docFile.filename || "document.pdf";
    const cleanFileName = filename.toLowerCase().endsWith(".pdf")
      ? filename
      : `${filename}.pdf`;

    // Return binary PDF stream with proper headers
    return new NextResponse(new Uint8Array(docFile.data), {
      status: 200,
      headers: {
        "Content-Type": docFile.contentType || "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(cleanFileName)}"`,
        "Content-Length": (docFile.sizeBytes || docFile.data.length).toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error: any) {
    console.error("Document serve error:", error);
    return new NextResponse("ফাইল প্রদর্শনে ত্রুটি হয়েছে", { status: 500 });
  }
}
