import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import WorkOrder from "@/models/work-order.model";
import Inquiry from "@/models/inquiry.model";
import cloudinary from "@/lib/cloudinary";
import { sendWhatsApp } from "@/lib/whatsapp";
import { getSiteUrl } from "@/lib/constants";

function uploadBufferToCloudinary(buffer: Buffer, folder: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    let name = "";
    let phone = "";
    let location = "";
    let landArea = "";
    let roadWidth = "";
    let buildingType = "Residential Building";
    let floors = "4-6 তলা";
    let requirements = "";
    let sketchUrl = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = (formData.get("name") as string) || "";
      phone = (formData.get("phone") as string) || "";
      location = (formData.get("location") as string) || "";
      landArea = (formData.get("landArea") as string) || "";
      roadWidth = (formData.get("roadWidth") as string) || "";
      buildingType = (formData.get("buildingType") as string) || "Residential Building";
      floors = (formData.get("floors") as string) || "4-6 তলা";
      requirements = (formData.get("requirements") as string) || "";

      const file = formData.get("sketchFile") as File | null;
      if (file && file.size > 0) {
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const uploadRes = await uploadBufferToCloudinary(buffer, "triple-h/client-sketches");
          sketchUrl = uploadRes?.secure_url || "";
        } catch (uploadErr) {
          console.error("Cloudinary sketch upload warning:", uploadErr);
        }
      }
    } else {
      const json = await req.json();
      name = json.name || "";
      phone = json.phone || "";
      location = json.location || "";
      landArea = json.landArea || "";
      roadWidth = json.roadWidth || "";
      buildingType = json.buildingType || "Residential Building";
      floors = json.floors || "4-6 তলা";
      requirements = json.requirements || "";
      sketchUrl = json.sketchUrl || "";
    }

    if (!name.trim() || !phone.trim()) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে আপনার নাম ও ফোন নম্বর লিখুন।" },
        { status: 400 }
      );
    }

    await dbConnect();

    const formattedRequirements = [
      `📐 জমির পরিমাপ: ${landArea || "উল্লেখিত নয়"}`,
      `🛣️ সামনের রাস্তা: ${roadWidth || "উল্লেখিত নয়"}`,
      `🏢 ভবনের ধরণ: ${buildingType} (${floors})`,
      sketchUrl ? `🖼️ আপলোডকৃত স্কেচ: ${sketchUrl}` : null,
      requirements ? `📝 ক্লায়েন্টের চাহিদা: ${requirements}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const projectTitle = `${name} সাহেবের ${buildingType} প্রজেক্ট (${location || "ঢাকা"})`;

    // 1. Create WorkOrder entry
    const workOrder = await WorkOrder.create({
      name,
      phone,
      projectTitle,
      projectLocation: location || "বাংলাদেশ",
      requirements: formattedRequirements,
      status: "pending",
      notes: sketchUrl ? `Sketch Uploaded: ${sketchUrl}` : "Direct Sketch Consultation Form",
    });

    // 2. Also register in Inquiries
    try {
      await Inquiry.create({
        name,
        phone,
        serviceType: "2d-drafting",
        source: "website",
        status: "new",
        message: `[খসড়া স্কেচ ও প্ল্যান রিকোয়েস্ট]\n${formattedRequirements}`,
      });
    } catch (e) {
      // non-fatal
    }

    // 3. Dispatch WhatsApp alert to Engr. Hasmot Ali (+880 1778-506500)
    const adminMsg = [
      `📐 *নতুন জমির খসড়া স্কেচ ও প্ল্যান রিকোয়েস্ট!*`,
      `Triple H Engineering Consultancy`,
      ``,
      `👤 নাম: *${name}*`,
      `📞 ফোন: *${phone}*`,
      `📍 অবস্থান: ${location || "N/A"}`,
      `📏 জমির মাপ: *${landArea || "N/A"}*`,
      `🛣️ রাস্তার চওড়া: *${roadWidth || "N/A"}*`,
      `🏗️ ধরণ: *${buildingType}* (${floors})`,
    ];
    if (sketchUrl) adminMsg.push(`🖼️ স্কেচ লিংক: ${sketchUrl}`);
    if (requirements) adminMsg.push(`📝 বিশেষ নোট: ${requirements}`);
    adminMsg.push(``);
    adminMsg.push(`🌐 সরাসরি ইনকোয়ারি দেখতে:`);
    adminMsg.push(`${getSiteUrl()}/admin/inquiries`);

    sendWhatsApp(adminMsg.join("\n"), "+8801778506500").catch((err) =>
      console.error("[WhatsApp] Admin sketch notification error:", err)
    );

    // 4. Dispatch client confirmation
    const clientConfirm = [
      `আসসালামুয়ালাইকুম *${name}*,`,
      ``,
      `ট্রিপল এইচ ইঞ্জিনিয়ারিং কনসালটেন্সিতে আপনার জমির পরিমাপ ও প্রাথমিক স্কেচ রিকোয়েস্ট সফলভাবে জমা হয়েছে ✅`,
      ``,
      `🏗️ প্রজেক্ট: *${projectTitle}*`,
      `🔖 ট্র্যাকিং রেফারেন্স: *WO-${workOrder._id.toString().slice(-6).toUpperCase()}*`,
      ``,
      `আমাদের প্রধান পরামর্শক ইঞ্জিনিয়ার মোঃ হাসমত আলী দ্রুত আপনার স্কেচ পর্যালোচনা করে ফোন বা হোয়াটসঅ্যাপে যোগাযোগ করবেন।`,
      ``,
      `📞 যেকোনো তথ্যে সরাসরি কল/হোয়াটসঅ্যাপ করুন: 01778-506500`,
      `🌐 ${getSiteUrl()}`,
      `ধন্যবাদ! 🙏`,
    ].join("\n");

    sendWhatsApp(clientConfirm, phone).catch((err) =>
      console.error("[WhatsApp] Client sketch confirmation error:", err)
    );

    return NextResponse.json({
      success: true,
      trackingId: `WO-${workOrder._id.toString().slice(-6).toUpperCase()}`,
      sketchUrl,
      message: "আপনার ড্রয়িং রিকোয়েস্ট সফলভাবে জমা হয়েছে!",
    });
  } catch (error: any) {
    console.error("Sketch Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "স্কেচ আপলোড করতে ব্যর্থ হয়েছে।" },
      { status: 500 }
    );
  }
}
