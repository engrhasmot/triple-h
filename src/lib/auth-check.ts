import { verifyToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value || req.headers.get("authorization")?.slice(7);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return payload as { email: string; role: string };
}
