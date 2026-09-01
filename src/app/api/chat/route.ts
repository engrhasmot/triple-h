import { NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

// ─── Knowledge Base ────────────────────────────────────────────────────────
const KB: { patterns: RegExp[]; response: string }[] = [
  // Greetings
  {
    patterns: [/hello|hi|হ্যালো|হেলো|আস্সালাম|salaam|salam|হ্যা/i],
    response: `আস্সালামু আলাইকুম! 👋 **Triple H Plandraft & Engineering**-এ স্বাগতম!\n\nআমি আপনাকে সাহায্য করতে পারি:\n- 📐 2D/3D Design সম্পর্কে\n- 💰 খরচের আনুমানিক হিসাব\n- 📋 রাজউক প্ল্যান পাসিং প্রক্রিয়া\n- 🏗️ সাইট সুপারভিশন\n\nআপনার প্রশ্ন করুন!`,
  },
  // Cost / Price
  {
    patterns: [/cost|price|খরচ|দাম|কত|rate|রেট|budget|বাজেট|টাকা|fee|ফি/i],
    response: `**নির্মাণ খরচের আনুমানিক হিসাব (প্রতি বর্গফুট):**\n\n🏠 **Standard:** ৳১,৮০০ – ২,০০০/sqft\n🏛️ **Premium:** ৳২,২০০ – ২,৫০০/sqft\n✨ **Luxury:** ৳২,৮০০ – ৩,৫০০+/sqft\n\n📊 **Design ফি (আলাদা):**\n- 2D Plan: ৳৫,০০০ – ৳২০,০০০\n- 3D Rendering: ৳৮,০০০ – ৳৩০,০০০\n- BOQ Estimation: ৳৩,০০০ – ৳১০,০০০\n\n💡 সঠিক বাজেট জানতে আমাদের **Cost Estimator** ব্যবহার করুন: [এখানে ক্লিক করুন](/cost-estimator)`,
  },
  // 2D Plan
  {
    patterns: [/2d|two.?d|নকশা|plan|প্ল্যান|floor.?plan|drawing|ড্রয়িং/i],
    response: `**2D Architectural & Structural Plan:**\n\n✅ আমরা যা করি:\n- AutoCAD Floor Plan (Ground to Roof)\n- Structural Reinforcement Drawing\n- Plumbing & Electrical Layout\n- Section & Elevation Drawing\n- RAJUK/Paurashava অনুমোদন যোগ্য Drawing\n\n⏱️ **সময়:** ৫ – ১৫ কার্যদিবস\n💰 **খরচ:** ৳৫,০০০ থেকে শুরু\n\nযোগাযোগ করুন: 📞 01778-506500`,
  },
  // 3D Design
  {
    patterns: [/3d|three.?d|render|রেন্ডার|exterior|ইন্টেরিয়র|interior|elevation|ভিজ্যুয়াল/i],
    response: `**3D Exterior & Interior Design:**\n\n🎨 Photorealistic 3D rendering আপনার বাড়ির নির্মাণের আগেই দেখতে পাবেন!\n\n✅ Includes:\n- 3D Exterior Elevation (Front, Side, Rear)\n- 3D Interior (Living Room, Bedroom, Kitchen)\n- Day & Night Rendering\n- Multiple Color Variants\n\n⏱️ **সময়:** ৩ – ৭ কার্যদিবস\n💰 **খরচ:** ৳৮,০০০ থেকে শুরু\n\n📲 WhatsApp করুন: +880 1778-506500`,
  },
  // Rajuk / Plan Passing
  {
    patterns: [/rajuk|রাজউক|plan.?pass|প্ল্যান.?পাস|approval|অনুমোদন|municipality|পৌরসভা|ইউপি|union/i],
    response: `**রাজউক/পৌরসভা প্ল্যান পাসিং সেবা:**\n\n📋 আমরা সম্পূর্ণ প্রক্রিয়া পরিচালনা করি:\n\n1️⃣ Architectural Drawing প্রস্তুতি\n2️⃣ Structural Drawing\n3️⃣ Application ফর্ম পূরণ\n4️⃣ ফি জমা ও দাখিল\n5️⃣ নিয়মিত Follow-up\n6️⃣ অনুমোদিত Copy সংগ্রহ\n\n⏱️ **সাধারণ সময়:** ৩০ – ৯০ কার্যদিবস (RAJUK)\n💰 **সার্ভিস চার্জ:** প্লট সাইজ অনুযায়ী\n\n📞 বিস্তারিত জানতে: 01778-506500`,
  },
  // BOQ
  {
    patterns: [/boq|bill.?of.?quant|প্রাক্কলন|estimate|এস্টিমেট|material|মালামাল/i],
    response: `**BOQ (Bill of Quantities) Estimation:**\n\n📊 আমাদের BOQ-তে থাকে:\n- রড ও সিমেন্টের পরিমাণ ও দাম\n- ইট, বালু, পাথরের হিসাব\n- টাইলস, রং, দরজা-জানালার খরচ\n- বিদ্যুৎ ও পানির লাইনের খরচ\n- মোট নির্মাণ বাজেট সারাংশ\n\n💡 আমাদের **অনলাইন Calculator** দিয়ে প্রাথমিক আইডিয়া নিন:\n👉 [Cost Estimator খুলুন](/cost-estimator)\n\n📞 বিস্তারিত BOQ: 01778-506500`,
  },
  // Site Supervision
  {
    patterns: [/supervision|সুপারভিশন|site.?visit|সাইট|inspector|ইন্সপেক্ট|quality.?check/i],
    response: `**সাইট সুপারভিশন সেবা:**\n\n👷 আমাদের অভিজ্ঞ ইঞ্জিনিয়ার আপনার নির্মাণ সাইটে:\n\n✅ কী কী দেখেন:\n- রড বাইন্ডিং চেক\n- কংক্রিট মিক্সচার যাচাই\n- ফর্মওয়ার্ক ইন্সপেকশন\n- প্রতি পর্যায়ে ছাড়পত্র\n- দৈনিক রিপোর্ট\n\n📅 সাইট ভিজিটের জন্য Appointment নিন:\n👉 [Appointment বুক করুন](/book-appointment)`,
  },
  // Track Plan
  {
    patterns: [/track|ট্র্যাক|file.?id|ফাইল|status|স্ট্যাটাস|where.?is|কোথায়|progress/i],
    response: `**আপনার প্ল্যান ফাইল ট্র্যাক করুন:**\n\n🔍 আপনার File ID বা ফোন নম্বর দিয়ে তাৎক্ষণিক অবস্থা দেখুন!\n\nStatus গুলো:\n📤 Submitted → 🔍 Under Review → ✏️ Revision Required → ✅ Approved\n\n👉 [Track Plan Status](/track-plan)\n\nFile ID না থাকলে আমাদের কল করুন: 📞 01778-506500`,
  },
  // Appointment / Book
  {
    patterns: [/appointment|অ্যাপয়েন্টমেন্ট|book|বুক|meeting|মিটিং|visit|ভিজিট|consultation|কনসালটেশন/i],
    response: `**অ্যাপয়েন্টমেন্ট বুক করুন:**\n\n📅 আমাদের সাথে দেখা করুন:\n- অফিস ভিজিট: সকাল ৯টা – রাত ৯টা\n- সাইট ভিজিট: পূর্ব নির্ধারিত সময়\n- অনলাইন কনসালটেশন: যেকোনো সময়\n\n📍 **অফিস:** Bypass Road, Ashulia, Savar, Dhaka\n\n👉 [Appointment বুক করুন](/book-appointment)\n📞 সরাসরি: 01778-506500\n💬 WhatsApp: +8801778506500`,
  },
  // Location / Address
  {
    patterns: [/address|ঠিকানা|location|অবস্থান|where|কোথায়|office|অফিস|ashulia|savar|dhaka/i],
    response: `**আমাদের অফিস:**\n\n📍 Bypass Road, Ashulia\nSavar, Dhaka, Bangladesh 1341\n\n🕐 **অফিস সময়:**\nশনি–বৃহস্পতি: সকাল ৯টা – রাত ৯টা\nশুক্রবার: সকাল ১০টা – সন্ধ্যা ৬টা\n\n📞 **ফোন:** 01631-186218, 01778-506500\n📧 **ইমেইল:** info@tripleh.com.bd\n\n🗺️ Google Maps-এ খুঁজতে: "Triple H Plandraft Ashulia"`,
  },
  // Contact / Phone
  {
    patterns: [/contact|যোগাযোগ|phone|ফোন|call|কল|number|নম্বর/i],
    response: `**আমাদের সাথে যোগাযোগ করুন:**\n\n📞 **01631-186218** (Engineer Hasmot)\n📞 **01778-506500** (Office)\n📧 **info@tripleh.com.bd**\n💬 WhatsApp: +8801778506500\n\n👉 [Contact Page](/contact)\n👉 [WhatsApp Chat](https://wa.me/8801778506500)\n\nবা অনলাইনে Message পাঠান: [Contact Form](/contact)`,
  },
  // Portfolio / Projects
  {
    patterns: [/portfolio|পোর্টফোলিও|project|প্রজেক্ট|work|কাজ|sample|স্যাম্পল|example|উদাহরণ/i],
    response: `**আমাদের কাজ দেখুন:**\n\n🏗️ আমরা সফলভাবে সম্পন্ন করেছি:\n- ১০০+ অনুমোদিত রাজউক প্ল্যান\n- ৫০+ 3D Elevation & Interior\n- ১০০% Client Satisfaction\n\n📸 [Portfolio দেখুন](/portfolio)\n\n**আমাদের বিশেষত্ব:**\n✅ Residential Building\n✅ Commercial Complex\n✅ Apartment Building\n✅ Factory & Warehouse`,
  },
  // BNBC
  {
    patterns: [/bnbc|building.?code|নিয়ম|regulation|setback|height|উচ্চতা|floor.?area.?ratio|far/i],
    response: `**বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC) মূল বিষয়:**\n\n🏛️ **সাধারণ নিয়ম:**\n- Setback: সামনে ও পাশে ন্যূনতম ৩ ফুট\n- Coverage: মোট প্লটের সর্বোচ্চ ৬০–৭০%\n- FAR: এলাকাভেদে ভিন্ন (RAJUK Zone অনুযায়ী)\n- Fire Exit: ৩ তলার বেশি হলে বাধ্যতামূলক\n\n⚠️ এলাকাভেদে নিয়ম পরিবর্তন হয়। আমাদের Engineers সঠিক তথ্য দিতে পারবে:\n📞 01778-506500`,
  },
  // Thank you
  {
    patterns: [/thank|ধন্যবাদ|thanks|শুক্রিয়া/i],
    response: `আপনাকে ধন্যবাদ! 🙏\n\nআমাদের সাথে থাকার জন্য কৃতজ্ঞ। আরও কোনো প্রশ্ন থাকলে অবশ্যই জানাবেন!\n\n📞 01778-506500\n💬 [WhatsApp](https://wa.me/8801778506500)`,
  },
];

const DEFAULT_RESPONSE = `ধন্যবাদ আপনার প্রশ্নের জন্য! 🙏\n\nআমি এই বিষয়ে নিশ্চিত নই, তবে আমাদের Engineering Team সরাসরি সাহায্য করতে পারবে:\n\n📞 **01778-506500** (সকাল ৯টা – রাত ৯টা)\n💬 [WhatsApp-এ Message করুন](https://wa.me/8801778506500)\n📧 info@tripleh.com.bd\n\nঅথবা নিচের বিষয়গুলো জিজ্ঞেস করতে পারেন:\n- 💰 নির্মাণ খরচ\n- 📐 2D/3D Design\n- 📋 রাজউক প্ল্যান পাসিং\n- 🏗️ সাইট সুপারভিশন`;

function matchResponse(userMessage: string): string {
  for (const entry of KB) {
    if (entry.patterns.some(p => p.test(userMessage))) {
      return entry.response;
    }
  }
  return DEFAULT_RESPONSE;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history }: { message: string; history: ChatMessage[] } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    const response = matchResponse(message.trim());
    const _ = history; // acknowledged (used for future context-aware upgrades)

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Chat service unavailable' }, { status: 500 });
  }
}
