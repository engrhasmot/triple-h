import { NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

interface KBEntry {
  patterns: RegExp[];
  response: string | ((ctx: { history: ChatMessage[]; userMessage: string }) => string);
  followUps?: string[];
  context?: string;
}

// ─── Smart Knowledge Base ────────────────────────────────────────────────────
const KB: KBEntry[] = [
  // ── Greetings ──
  {
    patterns: [/^(hi|hello|hey|হ্যালো|হেলো|আস্সালাম|salaam|salam|হ্যা|sup|yo)$/i],
    response: ({ history }) => {
      const hasHistory = history.filter(m => m.role === 'user').length > 0;
      if (hasHistory) {
        return `আবার স্বাগতম! 😊 আপনার আগের প্রশ্নের উত্তর দিতে পারিনি? নতুন কিছু জানতে চান?\n\nআমি এখনও সাহায্য করতে পারি:\n- 💰 খরচের হিসাব\n- 📐 নকশা সেবা\n- 📋 প্ল্যান পাসিং`;
      }
      return `আস্সালামু আলাইকুম! 👋 **Triple H Plandraft & Engineering**-এ স্বাগতম!\n\nআমি আপনার AI Engineering Assistant। আমি বুঝতে পারি আপনার প্রশ্নের অর্থ এবং সেরে উত্তর দিতে পারি!\n\n🏗️ আমি এই বিষয়ে সাহায্য করতে পারি:\n- 💰 নির্মাণ খরচ ও বাজেট\n- 📐 2D/3D Design ও নকশা\n- 📋 রাজউক/পৌরসভা প্ল্যান পাসিং\n- 🏗️ সাইট সুপারভিশন\n- 📊 BOQ ও এস্টিমেট\n\nআপনার প্রশ্ন লিখুন অথবা নিচে থেকে বাছাই করুন!`;
    },
    followUps: ["নির্মাণ খরচ কত?", "2D Plan সম্পর্কে বলুন", "Appointment বুক করব"],
  },
  // ── Cost / Price ──
  {
    patterns: [/cost|price|খরচ|দাম|কত|rate|রেট|budget|বাজেট|টাকা|fee|ফি|কত টাকা|কত খরচ|price|taka|টaka|billion|crore|lakh/i],
    response: ({ history }) => {
      const mentionedArea = history.some(m => m.content.match(/\d+\s*(sqft|sq\.?\s*ft|বর্গ|ft)/i));
      let base = `**নির্মাণ খরচের আনুমানিক হিসাব:**\n\n🏠 **Standard:** ৳১,৮০০ – ২,০০০/sqft\n🏛️ **Premium:** ৳২,২০০ – ২,৫০০/sqft\n✨ **Luxury:** ৳২,৮০০ – ৩,৫০০+/sqft\n\n📊 **Design ফি (আলাদা):**\n- 2D Plan: ৳৫,০০০ – ৳২০,০০০\n- 3D Rendering: ৳৮,০০০ – ৳৩০,০০০\n- BOQ Estimation: ৳৩,০০০ – ৳১০,০০০\n\n💡 সঠিক বাজেট জানতে **Area (sqft)** বলুন, আমি হিসাব করে দেব!`;
      if (mentionedArea) {
        base += `\n\n📎 বা সরাসরি [Cost Estimator](/cost-estimator) ব্যবহার করুন!`;
      }
      return base;
    },
    followUps: ["1200 sqft এর খরচ কত?", "Standard কি ভালো?", "Cost Estimator খুলুন"],
    context: "cost",
  },
  // ── Area-based calculation ──
  {
    patterns: [/(\d{2,4})\s*(sqft|sq\.?\s*ft|বর্গ|ft|ফুট)/i],
    response: ({ userMessage }) => {
      const match = userMessage.match(/(\d{2,4})\s*(sqft|sq\.?\s*ft|বর্গ|ft|ফুট)/i);
      const area = match ? parseInt(match[1]) : 1000;
      const standard = area * 1800;
      const premium = area * 2200;
      const luxury = area * 2800;
      const fmt = (n: number) => n.toLocaleString('en-IN');
      return `**${area} sqft নির্মাণ খরচের আনুমানিক হিসাব:**\n\n🏠 **Standard Quality:** ৳${fmt(area * 1800)} – ৳${fmt(area * 2000)}\n🏛️ **Premium Quality:** ৳${fmt(area * 2200)} – ৳${fmt(area * 2500)}\n✨ **Luxury Quality:** ৳${fmt(area * 2800)} – ৳${fmt(area * 3500)}\n\n📊 **৳${fmt(standard)}** থেকে শুরু (Standard)\n\n💡 **এই হিসাব আনুমানিক।** সঠিক দাম জানতে:\n- প্লটের লোকেশন\n- তলার সংখ্যা\n- ডিজাইনের ধরন\n\nসব কিছু মিলিয়ে [Cost Estimator](/cost-estimator) ব্যবহার করুন!`;
    },
    followUps: ["3D Design কত খরচ?", "রাজউক ফি আলাদা?", "Appointment নিতে চাই"],
    context: "cost",
  },
  // ── 2D Plan ──
  {
    patterns: [/2d|two.?d|নকশা|plan|প্ল্যান|floor.?plan|drawing|ড্রয়িং|আর্কিটেকচার/i],
    response: `**2D Architectural & Structural Plan:**\n\n✅ আমরা যা করি:\n- AutoCAD Floor Plan (Ground to Roof)\n- Structural Reinforcement Drawing\n- Plumbing & Electrical Layout\n- Section & Elevation Drawing\n- RAJUK/Paurashava অনুমোদন যোগ্য Drawing\n\n⏱️ **সময়:** ৫ – ১৫ কার্যদিবস\n💰 **খরচ:** ৳৫,০০০ থেকে শুরু\n\n📋 **আপনার প্ল্যানের জন্য দরকার:**\n- প্লটের সাইজ (দৈর্ঘ্য × প্রস্থ)\n- তলার সংখ্যা\n- পারিবারিক চাহিদা\n\n📞 যোগাযোগ: 01778-506500`,
    followUps: ["3D Design ও করেন?", "রাজউক পাস করাবো", "খরচ কত হবে?"],
    context: "2d",
  },
  // ── 3D Design ──
  {
    patterns: [/3d|three.?d|render|রেন্ডার|exterior|ইন্টেরিয়র|interior|elevation|ভিজ্যুয়াল|ভিউ/i],
    response: `**3D Exterior & Interior Design:**\n\n🎨 Photorealistic 3D rendering দিয়ে আপনার বাড়ির নির্মাণের আগেই দেখে নিন!\n\n✅ **3D Exterior:**\n- Front, Side, Rear Elevation\n- Day & Night Rendering\n- Multiple Color Variants\n\n✅ **3D Interior:**\n- Living Room, Bedroom, Kitchen\n- Furniture Layout\n- Material Selection\n\n⏱️ **সময়:** ৩ – ৭ কার্যদিবস\n💰 **খরচ:** ৳৮,০০০ থেকে শুরু\n\n📸 আমাদের কাজ দেখুন: [Portfolio](/portfolio)`,
    followUps: ["2D Plan ও করব", "পোর্টফোলিও দেখুন", "সময় কত লাগবে?"],
    context: "3d",
  },
  // ── Rajuk / Plan Passing ──
  {
    patterns: [/rajuk|রাজউক|plan.?pass|প্ল্যান.?পাস|approval|অনুমোদন|municipality|পৌরসভা|ইউপি|union|সিটি কর্পোরেশন|নগরী/i],
    response: `**রাজউক/পৌরসভা প্ল্যান পাসিং সেবা:**\n\n📋 আমরা সম্পূর্ণ প্রক্রিয়া পরিচালনা করি:\n\n1️⃣ Architectural Drawing প্রস্তুতি\n2️⃣ Structural Drawing\n3️⃣ Application ফর্ম পূরণ\n4️⃣ ফি জমা ও দাখিল\n5️⃣ নিয়মিত Follow-up\n6️⃣ অনুমোদিত Copy সংগ্রহ\n\n⏱️ **সাধারণ সময়:**\n- পৌরসভা/ইউপি: ১৫ – ৩০ দিন\n- RAJUK: ৩০ – ৯০ দিন\n\n💰 **সার্ভিস চার্জ:** প্লট সাইজ ও এলাকা অনুযায়ী\n\n📞 বিস্তারিত: 01778-506500`,
    followUps: ["ফি কত?", "কত দিন লাগবে?", "Documents কি লাগবে?"],
    context: "rajuk",
  },
  // ── BOQ / Estimate ──
  {
    patterns: [/boq|bill.?of.?quant|প্রাক্কলন|estimate|এস্টিমেট|material|মালামাল|রড|সিমেন্ট|ইট|বালু|tile|রং|দরজা|জানালা/i],
    response: `**BOQ (Bill of Quantities) Estimation:**\n\n📊 আমাদের BOQ-তে থাকে:\n- রড ও সিমেন্টের পরিমাণ ও দাম\n- ইট, বালু, পাথরের হিসাব\n- টাইলস, রং, দরজা-জানালার খরচ\n- বিদ্যুৎ ও পানির লাইনের খরচ\n- মোট নির্মাণ বাজেট সারাংশ\n\n💡 আমাদের **অনলাইন Calculator** দিয়ে প্রাথমিক আইডিয়া নিন:\n👉 [Cost Estimator](/cost-estimator)\n\n📞 বিস্তারিত BOQ: 01778-506500`,
    followUps: ["Cost Estimator খুলুন", "রড কত লাগবে?", "সম্পূর্ণ BOQ চাই"],
    context: "boq",
  },
  // ── Site Supervision ──
  {
    patterns: [/supervision|সুপারভিশন|site.?visit|সাইট|inspector|ইন্সপেক্ট|quality.?check|মনিটর|কন্ট্রোল|তত্ত্বাবধান/i],
    response: `**সাইট সুপারভিশন সেবা:**\n\n👷 আমাদের অভিজ্ঞ ইঞ্জিনিয়ার আপনার নির্মাণ সাইটে:\n\n✅ **কী কী দেখেন:**\n- রড বাইন্ডিং চেক\n- কংক্রিট মিক্সচার যাচাই\n- ফর্মওয়ার্ক ইন্সপেকশন\n- প্রতি পর্যায়ে ছাড়পত্র\n- দৈনিক রিপোর্ট\n\n📅 সাইট ভিজিটের জন্য Appointment নিন:\n👉 [Appointment বুক করুন](/book-appointment)\n\n📞 01778-506500`,
    followUps: ["Appointment বুক করুন", "কত বার আসেন?", "খরচ কত?"],
    context: "supervision",
  },
  // ── Track Plan ──
  {
    patterns: [/track|ট্র্যাক|file.?id|ফাইল|status|স্ট্যাটাস|where.?is|কোথায়|progress|অবস্থা|কই|আপডেট/i],
    response: `**আপনার প্ল্যান ফাইল ট্র্যাক করুন:**\n\n🔍 আপনার File ID বা ফোন নম্বর দিয়ে তাৎক্ষণিক অবস্থা দেখুন!\n\n📤 **Status গুলো:**\n- Submitted → দাখিল হয়েছে\n- Under Review → পর্যালোচনাধীন\n- Revision Required → সংশোধন প্রয়োজন\n- Approved → অনুমোদিত ✅\n\n👉 [Track Plan Status](/track-plan)\n\nFile ID না থাকলে কল করুন: 📞 01778-506500`,
    followUps: ["Track Plan খুলুন", "File ID কি?", "Status কি এখন?"],
    context: "track",
  },
  // ── Appointment / Book ──
  {
    patterns: [/appointment|অ্যাপয়েন্টমেন্ট|book|বুক|meeting|মিটিং|visit|ভিজিট|consultation|কনসালটেশন|দেখা|সাক্ষাৎ|ফিরে|এসে|আসব|যাব/i],
    response: `**অ্যাপয়েন্টমেন্ট বুক করুন:**\n\n📅 আমাদের সাথে দেখা করুন:\n- 🏢 অফিস ভিজিট: শনি–বৃহ: ৯টা – ৯টা\n- 🏗️ সাইট ভিজিট: পূর্ব নির্ধারিত সময়\n- 💻 অনলাইন কনসালটেশন\n\n📍 **অফিস:** Aysha Monjil, House 14/05, Savar Radio Colony, Dhaka\n\n👉 [Appointment বুক করুন](/book-appointment)\n📞 সরাসরি: 01778-506500\n💬 WhatsApp: +8801778506500`,
    followUps: ["বুক করুন", "অফিসের সময় কত?", "লোকেশন দেখুন"],
    context: "appointment",
  },
  // ── Location / Address ──
  {
    patterns: [/address|ঠিকানা|location|অবস্থান|where|কোথায়|office|অফিস|savar|dhaka|ashulia|জিরাবো|রেডিও|colony|মানজিল/i],
    response: `**আমাদের অফিস:**\n\n📍 Aysha Monjil, House 14/05, Ward No 1\nNoyabari, Savar Radio Colony, Dhaka\n\n🕐 **অফিস সময়:**\nশনি–বৃহস্পতি: সকাল ৯টা – রাত ৯টা\nশুক্রবার: সকাল ১০টা – সন্ধ্যা ৬টা\n\n📞 **ফোন:** 01631-186218, 01778-506500\n📧 **ইমেইল:** info@tripleh.com.bd\n\n🗺️ [Google Maps-এ দেখুন](https://maps.app.goo.gl/wdBzkKfqCw4Kbggs7)`,
    followUps: ["Map দেখুন", "Appointment বুক করুন", "ফোন নম্বর দিন"],
    context: "location",
  },
  // ── Contact / Phone ──
  {
    patterns: [/contact|যোগাযোগ|phone|ফোন|call|কল|number|নম্বর|mobile|মোবাইল|whatsapp/i],
    response: `**আমাদের সাথে যোগাযোগ করুন:**\n\n📞 **Engineer Hasmot:** 01631-186218\n📞 **Office:** 01778-506500\n📧 **ইমেইল:** info@tripleh.com.bd\n💬 **WhatsApp:** +8801778506500\n\n👉 [Contact Page](/contact)\n👉 [WhatsApp Chat](https://wa.me/8801778506500)\n\n⏰ সকাল ৯টা – রাত ৯টা পর্যন্ত পাওয়া যায়।`,
    followUps: ["WhatsApp এ কথা বলুন", "কল করুন", "ইমেইল পাঠান"],
    context: "contact",
  },
  // ── Portfolio / Projects ──
  {
    patterns: [/portfolio|পোর্টফোলিও|project|প্রজেক্ট|work|কাজ|sample|স্যাম্পল|example|উদাহরণ|কি কি করেন|সম্পন্ন/i],
    response: `**আমাদের কাজ দেখুন:**\n\n🏗️ আমরা সফলভাবে সম্পন্ন করেছি:\n- ১০০+ অনুমোদিত রাজউক প্ল্যান\n- ৫০+ 3D Elevation & Interior\n- ১০০% Client Satisfaction\n\n📸 [Portfolio দেখুন](/portfolio)\n\n**বিশেষত্ব:**\n✅ Residential Building\n✅ Commercial Complex\n✅ Apartment Building\n✅ Factory & Warehouse`,
    followUps: ["Portfolio খুলুন", "আপনাদের সেরা কাজ?", "আমার জন্য কি করতে পারেন?"],
    context: "portfolio",
  },
  // ── BNBC ──
  {
    patterns: [/bnbc|building.?code|নিয়ম|regulation|setback|height|উচ্চতা|floor.?area.?ratio|far|কভারেজ|রিবেট/i],
    response: `**বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC):**\n\n🏛️ **সাধারণ নিয়ম:**\n- Setback: সামনে ও পাশে ন্যূনতম ৩ ফুট\n- Coverage: মোট প্লটের ৬০–৭০%\n- FAR: এলাকাভেদে ভিন্ন\n- Fire Exit: ৩ তলার বেশি হলে বাধ্যতামূলক\n\n⚠️ এলাকাভেদে নিয়ম পরিবর্তন হয়। আমাদের Engineers সঠিক তথ্য দিতে পারবে:\n📞 01778-506500`,
    followUps: ["আমার প্লটে কত তলা হবে?", "Setback কি?", "工程师 এর সাথে কথা বলুন"],
    context: "bnbc",
  },
  // ── Thank you ──
  {
    patterns: [/thank|ধন্যবাদ|thanks|শুক্রিয়া|মেহেরবান|good|ভালো|great|দারুণ|excellent|superb|awesome/i],
    response: `আপনাকে ধন্যবাদ! 🙏\n\nআমাদের সাথে থাকার জন্য কৃতজ্ঞ। আরও কোনো প্রশ্ন থাকলে অবশ্যই জানাবেন!\n\n📞 01778-506500\n💬 [WhatsApp](https://wa.me/8801778506500)`,
    followUps: ["আর কিছু জানতে চাই", "Portfolio দেখুন", "Appointment বুক করুন"],
  },
  // ── Complaint / Problem ──
  {
    patterns: [/complaint|অভিযোগ|problem|সমস্যা|issue|বিষয়|bad|খারাপ|worst|সবচেয়ে খারাপ|angry|রাগ|frustrated|হতাশ/i],
    response: `আমি আপনার হতাশা বুঝতে পারছি। 🙏\n\n**আমাদের সাথে সরাসরি যোগাযোগ করুন:**\n\n📞 **Engineer Hasmot:** 01631-186218\n📞 **Office:** 01778-506500\n📧 **ইমেইল:** info@tripleh.com.bd\n💬 **WhatsApp:** +8801778506500\n\n⏰ সকাল ৯টা – রাত ৯টা আমরা সাহায্য করতে প্রস্তুত।`,
    followUps: ["কল করুন", "WhatsApp এ পাঠান", "ফিরে যান"],
    context: "complaint",
  },
  // ── Who are you ──
  {
    patterns: [/কি|কোন|who|what|কে|তুমি কি|আপনি কি|তোমার নাম|your.?name|bot|চ্যাটবট|ai/i],
    response: `আমি **Triple H Assistant** 🤖\n\nআমি একটি AI-powered ChatBot যে আপনাকে **Triple H Plandraft & Engineering**-এর সেবা সম্পর্কে জানাতে পারি।\n\nআমি বুঝতে পারি:\n- ✅ আপনার প্রশ্নের অর্থ\n- ✅ Context (আগের কথা মনে রাখি)\n- ✅ বাংলা ও ইংরেজি\n\nতবে জটিল বিষয়ে **Engineer Hasmot** (01631-186218) এর সাথে কথা বলুন!`,
    followUps: ["সেবা সম্পর্কে বলুন", "যোগাযোগ করুন", "Portfolio দেখুন"],
  },
  // ── How / কীভাবে ──
  {
    patterns: [/কীভাবে|কিভাবে|how|কোনভাবে|steps|পদ্ধতি|process|প্রক্রিয়া|শুরু|start|begin/i],
    response: `**শুরু করার পদ্ধতি:**\n\n1️⃣ **প্রথমে কল করুন:** 01778-506500\n2️⃣ **প্লটের তথ্য দিন:** সাইজ, লোকেশন, তলার সংখ্যা\n3️⃣ **অ্যাপয়েন্টমেন্ট নিন:** অফিস বা সাইট ভিজিট\n4️⃣ **Design ফাইনাল করুন:** 2D/3D Layout\n5️⃣ **প্ল্যান পাস করুন:** RAJUK/পৌরসভা\n6️⃣ **নির্মাণ শুরু করুন:** সাইট সুপারভিশন সহ\n\n👉 এখনই [Appointment বুক করুন](/book-appointment)!`,
    followUps: ["Appointment বুক করুন", "খরচ কত হবে?", "ফোন নম্বর দিন"],
    context: "process",
  },
  // ── Time / সময় ──
  {
    patterns: [/time|সময়|কখন|when|duration|দিন|মাস|কতদিন|কতদিনে|how.?long|length/i],
    response: `**সময়কাল (আনুমানিক):**\n\n📐 **2D Plan:** ৫ – ১৫ কার্যদিবস\n🎨 **3D Design:** ৩ – ৭ কার্যদিবস\n📋 **RAJUK Approval:** ৩০ – ৯০ দিন\n🏛️ **পৌরসভা:** ১৫ – ৩০ দিন\n🏗️ **নির্মাণ (১০০০ sqft):** ৬ – ১২ মাস\n\n⚠️ সময় নির্ভর করে:\n- প্লটের লোকেশন\n- তলার সংখ্যা\n- ডিজাইনের জটিলতা\n\n📞 সঠিক সময় জানতে: 01778-506500`,
    followUps: ["এখনই শুরু করুন", "Appointment নিন", "প্রক্রিয়া বলুন"],
    context: "time",
  },
  // ── Payment / পেমেন্ট ──
  {
    patterns: [/payment|পেমেন্ট|বিল|bill|invoice|ইনভয়েস|টাকা দেব|কিস্তি|installment|advance|অগ্রিম|পেমেন্ট/i],
    response: `**পেমেন্ট সিস্টেম:**\n\n💰 আমাদের পেমেন্ট সিস্টেম:\n- **অগ্রিম:** কাজ শুরুর আগে ৫০%\n- **মধ্যবর্তী:** কাজ ৫০% শেষে ২৫%\n- **শেষ:** কাজ শেষে ২৫%\n\n📋 **পেমেন্ট মেথড:**\n- নগদ\n- বিকাশ/নগদ/রকেট\n- ব্যাংক ট্রান্সফার\n\n📞 বিস্তারিত জানতে: 01778-506500`,
    followUps: ["Invoice দিন", "কত টাকা?", "Payment করুন"],
    context: "payment",
  },
];

// ─── Fuzzy Match Helper ──────────────────────────────────────────────────────
function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyMatch(input: string, keywords: string[]): boolean {
  const lower = input.toLowerCase();
  return keywords.some(kw => {
    if (lower.includes(kw)) return true;
    if (kw.length > 3 && levenshteinDistance(lower, kw) <= 2) return true;
    return false;
  });
}

// ─── Smart Follow-up Detection ───────────────────────────────────────────────
function detectFollowUp(userMessage: string, history: ChatMessage[]): string | null {
  if (history.length < 2) return null;
  const lastBotMsg = [...history].reverse().find(m => m.role === 'bot');
  if (!lastBotMsg) return null;

  const lower = userMessage.toLowerCase();

  // Check if user is selecting a follow-up
  if (lower.match(/^(হ্যাঁ|জি|yes|ok|thik|ঠিক|আচ্ছা|please|দরকার|চাই|করুন|দিন|বলুন|খুলুন|নিন)$/i)) {
    if (lastBotMsg.content.includes('Cost Estimator')) return 'cost_estimator';
    if (lastBotMsg.content.includes('Appointment') || lastBotMsg.content.includes('বুক')) return 'appointment';
    if (lastBotMsg.content.includes('Portfolio')) return 'portfolio';
    if (lastBotMsg.content.includes('WhatsApp')) return 'whatsapp';
    if (lastBotMsg.content.includes('Contact')) return 'contact';
  }

  // Check context-based follow-ups
  if (lastBotMsg.content.includes('Cost Estimator') && lower.match(/হ্যাঁ|yes|ok|খুলুন/)) {
    return 'cost_estimator';
  }

  return null;
}

// ─── Sentiment Detection ─────────────────────────────────────────────────────
function detectSentiment(msg: string): 'positive' | 'negative' | 'neutral' {
  const positive = /ভালো|good|great|awesome|excellent|thanks|ধন্যবাদ|superb|দারুণ|সুন্দর|সেরা|best|love/i;
  const negative = /খারাপ|bad|worst|problem|সমস্যা|complaint|অভিযোগ|angry|রাগ|frustrated|হতাশ|দুঃখিত|sorry/i;
  if (positive.test(msg)) return 'positive';
  if (negative.test(msg)) return 'negative';
  return 'neutral';
}

// ─── Context-Aware Response Modifier ─────────────────────────────────────────
function modifyWithContext(response: string, sentiment: string, ctx?: string): string {
  let prefix = '';
  if (sentiment === 'negative') {
    prefix = 'আমি আপনার হতাশা বুঝতে পারছি। 🙏\n\n';
  } else if (sentiment === 'positive') {
    prefix = '';
  }

  return prefix + response;
}

// ─── Default Response ────────────────────────────────────────────────────────
const DEFAULT_RESPONSE = `ধন্যবাদ আপনার প্রশ্নের জন্য! 🙏\n\nআমি এই বিষয়ে নিশ্চিত নই, তবে আমাদের Engineering Team সরাসরি সাহায্য করতে পারবে:\n\n📞 **01778-506500** (সকাল ৯টা – রাত ৯টা)\n💬 [WhatsApp-এ Message করুন](https://wa.me/8801778506500)\n📧 info@tripleh.com.bd\n\nঅথবা এই বিষয়গুলো জিজ্ঞেস করতে পারেন:`;

const DEFAULT_FOLLOWUPS = ["নির্মাণ খরচ কত?", "2D Plan সম্পর্কে বলুন", "যোগাযোগ করুন", "Portfolio দেখুন"];

// ─── Main Response Function ──────────────────────────────────────────────────
function getSmartResponse(userMessage: string, history: ChatMessage[]): { response: string; followUps: string[] } {
  const msg = userMessage.trim();

  // 1. Check follow-up context
  const followUp = detectFollowUp(msg, history);
  if (followUp === 'cost_estimator') {
    return {
      response: `চমৎকার! 👏 [Cost Estimator](/cost-estimator) এখনই খুলুন।\n\nসেখানে আপনি দিতে পারবেন:\n- প্লটের সাইজ\n- তলার সংখ্যা\n- Quality Level\n\nএবং তাৎক্ষণিক খরচের হিসাব পাবেন!`,
      followUps: ["Appointment বুক করুন", "3D Design কত?", "WhatsApp এ কথা বলুন"],
    };
  }
  if (followUp === 'appointment') {
    return {
      response: `[Appointment বুক করুন](/book-appointment) - এখনই!\n\n📅 আপনি বেছে নিতে পারেন:\n- 🏢 অফিস ভিজিট\n- 🏗️ সাইট ভিজিট\n- 💻 অনলাইন কনসালটেশন\n\n📍 Aysha Monjil, Savar Radio Colony, Dhaka\n📞 01778-506500`,
      followUps: ["লোকেশন দেখুন", "সময় কত?", "ফোন নম্বর দিন"],
    };
  }
  if (followUp === 'portfolio') {
    return {
      response: `[Portfolio দেখুন](/portfolio) - আমাদের সম্পন্ন প্রকল্প! 📸\n\n🏗️ ১০০+ সফল প্রকল্প সম্পন্ন!\n✅ Residential, Commercial, Industrial\n✅ 100% Client Satisfaction`,
      followUps: ["নির্মাণ খরচ কত?", "2D Plan করব", "Appointment নিন"],
    };
  }
  if (followUp === 'whatsapp') {
    return {
      response: `WhatsApp-এ সরাসরি কথা বলুন! 💬\n\n👉 [WhatsApp Chat খুলুন](https://wa.me/8801778506500)\n\nবা নম্বর সেভ করুন: **+8801778506500**`,
      followUps: ["ফোনে কল করুন", "অফিসে আসুন", "ফিরে যান"],
    };
  }

  // 2. Detect sentiment
  const sentiment = detectSentiment(msg);

  // 3. KB pattern matching
  for (const entry of KB) {
    if (entry.patterns.some(p => p.test(msg))) {
      let response: string;
      if (typeof entry.response === 'function') {
        response = entry.response({ history, userMessage: msg });
      } else {
        response = entry.response;
      }
      response = modifyWithContext(response, sentiment, entry.context);
      return {
        response,
        followUps: entry.followUps || DEFAULT_FOLLOWUPS,
      };
    }
  }

  // 4. Fuzzy matching fallback
  const fuzzyKeywords: Record<string, string[]> = {
    cost: ['খরচ', 'দাম', 'price', 'cost', 'rate', 'বাজেট'],
    design: ['নকশা', 'plan', 'drawing', 'design', 'ড্রয়িং'],
    approval: ['পাস', 'approval', 'অনুমোদন', 'রাজউক'],
    supervision: ['সাইট', 'site', 'visit', 'supervision'],
    contact: ['যোগাযোগ', 'contact', 'phone', 'ফোন', 'call'],
    appointment: ['বুক', 'book', 'appointment', 'meeting'],
    track: ['track', 'status', 'ফাইল', 'file'],
  };

  for (const [topic, keywords] of Object.entries(fuzzyKeywords)) {
    if (fuzzyMatch(msg, keywords)) {
      const matchedEntry = KB.find(e => e.context === topic);
      if (matchedEntry) {
        let response: string;
        if (typeof matchedEntry.response === 'function') {
          response = matchedEntry.response({ history, userMessage: msg });
        } else {
          response = matchedEntry.response;
        }
        return {
          response: `আমি বুঝেছি আপনি **${topic}** সম্পর্কে জানতে চাচ্ছেন।\n\n${response}`,
          followUps: matchedEntry.followUps || DEFAULT_FOLLOWUPS,
        };
      }
    }
  }

  // 5. Default
  return {
    response: DEFAULT_RESPONSE,
    followUps: DEFAULT_FOLLOWUPS,
  };
}

// ─── API Route ───────────────────────────────────────────────────────────────
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

    const result = getSmartResponse(message.trim(), history || []);

    return NextResponse.json({
      success: true,
      response: result.response,
      followUps: result.followUps,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Chat service unavailable' }, { status: 500 });
  }
}
