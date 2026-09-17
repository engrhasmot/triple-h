import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import ClientUser from "@/models/client-user.model";
import Inquiry from "@/models/inquiry.model";
import { verifyClientToken } from "@/lib/auth";
import { sendWhatsApp } from "@/lib/whatsapp";

const ADMIN_NOTIFY_WHATSAPP = "+8801778506500";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("client_token")?.value;

    let clientUser: any = null;
    if (token) {
      const payload: any = await verifyClientToken(token);
      if (payload?.clientId) {
        await dbConnect();
        clientUser = await ClientUser.findById(payload.clientId).lean();
      }
    }

    const body = await req.json();
    const { subject, category, message, fileId, preferredDate, contactPhone } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "আপনার বার্তা বা অনুরোধটি লিখুন" }, { status: 400 });
    }

    await dbConnect();

    const clientName = clientUser ? clientUser.name : (body.name || "Client");
    const clientPhone = contactPhone || (clientUser ? clientUser.phone : body.phone || "");

    const inquiry = await Inquiry.create({
      name: clientName,
      phone: clientPhone,
      email: clientUser?.email || "",
      service: category || "Client Portal Support",
      message: `[Client Portal Request - File: ${fileId || "N/A"}]
বিষয়: ${subject || "সাধারণ অনুসন্ধান"}
ক্যাটাগরি: ${category || "General"}
পছন্দের তারিখ: ${preferredDate || "জরুরি"}
বিস্তারিত:
${message.trim()}`,
      status: "new",
    });

    // Send instant WhatsApp notification to Engr. Hasmot Ali
    try {
      const adminMsg = `📩 *নতুন ক্লায়েন্ট রিকোয়েস্ট (Client Portal)*

👤 *ক্লায়েন্ট:* ${clientName}
📱 *ফোন:* ${clientPhone}
📁 *ফাইল আইডি:* ${fileId || "N/A"}
📌 *বিষয়:* ${subject || "সাপোর্ট / সাইট ভিজিট"}
📂 *ক্যাটাগরি:* ${category || "General Inquiry"}
📅 *পছন্দের তারিখ:* ${preferredDate || "যেকোনো সময়"}

📝 *বার্তা:*
${message.trim()}

🔗 *অ্যাডমিন প্যানেল:*
https://triple-h-engineering.vercel.app/admin/inquiries`;

      await sendWhatsApp(ADMIN_NOTIFY_WHATSAPP, adminMsg);
    } catch (waErr) {
      console.error("WhatsApp notify error:", waErr);
    }

    return NextResponse.json({
      success: true,
      message: "আপনার অনুরোধটি গ্রহণ করা হয়েছে। ইঞ্জিনিয়ার মোঃ হাসমত আলী দ্রুত যোগাযোগ করবেন।",
      inquiryId: inquiry._id,
    });
  } catch (error: any) {
    console.error("Client Support Ticket Error:", error);
    return NextResponse.json({ error: error?.message || "অনুরোধটি পাঠানো সম্ভব হয়নি" }, { status: 500 });
  }
}
