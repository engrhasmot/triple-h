import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/user.model";
import ActivityLog from "@/models/activity-log.model";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const user = await User.findOne({ email: (payload as any).email }).select("-password");

    if (!user) {
      return NextResponse.json({
        name: "Admin",
        email: (payload as any).email || process.env.ADMIN_EMAIL,
        role: (payload as any).role || "admin",
        isActive: true,
        lastLogin: new Date(),
      });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, currentPassword, newPassword } = await req.json();
    await dbConnect();

    const email = (payload as any).email;
    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
      if (!ADMIN_PASSWORD_HASH) {
        return NextResponse.json({ error: "Server authentication error" }, { status: 500 });
      }
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, ADMIN_PASSWORD_HASH);
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      if (newPassword && newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }
      const hashedPassword = newPassword ? await bcrypt.hash(newPassword, 10) : ADMIN_PASSWORD_HASH;
      user = await User.create({
        name: name || "Admin",
        email: email || process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });
    } else {
      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      } else if (newPassword) {
        return NextResponse.json({ error: "Current password is required to change password" }, { status: 400 });
      }

      if (name) user.name = name;
      if (newPassword) {
        if (newPassword.length < 8) {
          return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
        }
        user.password = await bcrypt.hash(newPassword, 10);
      }
      await user.save();
    }

    // Log Activity
    try {
      await ActivityLog.create({
        action: "UPDATE",
        resource: "Settings",
        performedBy: email || "admin",
        details: newPassword ? "Updated admin password & profile" : "Updated admin profile name",
      });
    } catch (e) {
      console.warn("Failed to write activity log:", e);
    }

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (err: any) {
    console.error("Settings Update Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
