import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const EXPORT_COLLECTIONS = [
  "users",
  "projects",
  "blogs",
  "teammembers",
  "testimonials",
  "faqs",
  "inquiries",
  "appointments",
  "planstatuses",
  "pageviews",
  "medias",
  "activitylogs",
];

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission((payload as any).role, "canBackup")) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    await dbConnect();
    const mongoose = (await import("mongoose")).default;
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database not connected");

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const backupData: Record<string, unknown[]> = {};

    for (const name of EXPORT_COLLECTIONS) {
      if (collectionNames.includes(name)) {
        const docs = await db.collection(name).find({}).toArray();
        backupData[name] = docs.map((doc) => {
          const { _id, ...rest } = doc;
          return { _id: _id.toString(), ...rest };
        });
      } else {
        backupData[name] = [];
      }
    }

    backupData._exportedAt = new Date().toISOString() as any;
    backupData._exportedBy = (payload as any).email as any;

    const jsonStr = JSON.stringify(backupData, null, 2);
    const fileName = `tripleh_backup_${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Backup failed" }, { status: 500 });
  }
}
