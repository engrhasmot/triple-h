/**
 * WhatsApp Notification Library
 *
 * Supports:
 *  - Console logging (fallback / development) — WHATSAPP_PROVIDER=console
 *  - Green API (greenapi.com)                 — WHATSAPP_PROVIDER=green-api
 *  - Twilio WhatsApp API                      — WHATSAPP_PROVIDER=twilio
 *
 * Required env vars (Green API):
 *   GREENAPI_URL            — e.g. https://7105.api.greenapi.com
 *   GREENAPI_ID_INSTANCE    — e.g. 710522730548
 *   GREENAPI_TOKEN          — Your instance API token
 *   ADMIN_WHATSAPP_NUMBER   — Your WhatsApp number, e.g. +8801778506500
 */

export interface WhatsAppResult {
  success: boolean;
  message: string;
  provider: string;
}

// --- Helpers ---

function formatBDT(amount: number): string {
  return 'BDT ' + amount.toLocaleString('en-BD');
}

function nowBD(): string {
  return new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Convert +8801XXXXXXXX or 01XXXXXXXX → 8801XXXXXXXX@c.us (Green API chatId format) */
function toGreenChatId(phone: string): string {
  let clean = phone.replace(/[+\s\-()]/g, '');
  if (clean.startsWith('0')) {
    clean = '88' + clean;
  }
  return `${clean}@c.us`;
}

// --- Providers ---

async function sendViaGreenApi(to: string, body: string): Promise<WhatsAppResult> {
  const apiUrl   = process.env.GREENAPI_URL;
  const idInst   = process.env.GREENAPI_ID_INSTANCE;
  const apiToken = process.env.GREENAPI_TOKEN;

  if (!apiUrl || !idInst || !apiToken) {
    console.warn('[WhatsApp] Green API credentials not set — falling back to console.');
    return sendViaConsole(to, body);
  }

  const chatId = toGreenChatId(to);
  const url = `${apiUrl}/waInstance${idInst}/sendMessage/${apiToken}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message: body }),
  });

  const data = await response.json();

  if (response.ok && data.idMessage) {
    console.log(`[WhatsApp] Sent via Green API to ${chatId} — ID: ${data.idMessage}`);
    return { success: true, message: 'WhatsApp sent via Green API', provider: 'green-api' };
  }

  console.error('[WhatsApp] Green API error:', data);
  return { success: false, message: data?.message || 'WhatsApp send failed', provider: 'green-api' };
}

async function sendViaTwilio(to: string, body: string): Promise<WhatsAppResult> {
  const sid       = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from      = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !authToken || !from) {
    console.warn('[WhatsApp] Twilio credentials not set — falling back to console.');
    return sendViaConsole(to, body);
  }

  const toFormatted   = to.startsWith('whatsapp:')   ? to   : `whatsapp:${to}`;
  const fromFormatted = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
  const credentials   = Buffer.from(`${sid}:${authToken}`).toString('base64');
  const url           = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

  const params = new URLSearchParams({ To: toFormatted, From: fromFormatted, Body: body });
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const data = await response.json();
  if (response.ok) {
    console.log(`[WhatsApp] Sent via Twilio to ${toFormatted} — SID: ${data.sid}`);
    return { success: true, message: 'WhatsApp sent via Twilio', provider: 'twilio' };
  }

  console.error('[WhatsApp] Twilio error:', data);
  return { success: false, message: data?.message || 'WhatsApp send failed', provider: 'twilio' };
}

function sendViaConsole(to: string, body: string): WhatsAppResult {
  console.log('\n💬 [WHATSAPP NOTIFICATION — Console Fallback]');
  console.log(`   To: ${to}`);
  console.log(`   Message:\n${body}\n`);
  return { success: true, message: 'WhatsApp logged to console (dev mode)', provider: 'console' };
}

// --- Main Sender ---

export async function sendWhatsApp(body: string, recipient?: string): Promise<WhatsAppResult> {
  const provider     = process.env.WHATSAPP_PROVIDER || 'console';
  const targetNumber = recipient || process.env.ADMIN_WHATSAPP_NUMBER || '';

  if (!targetNumber) {
    console.warn('[WhatsApp] Target WhatsApp number not set — skipping notification.');
    return { success: false, message: 'WhatsApp number not configured', provider };
  }

  try {
    switch (provider) {
      case 'green-api':
        return await sendViaGreenApi(targetNumber, body);
      case 'twilio':
        return await sendViaTwilio(targetNumber, body);
      default:
        return sendViaConsole(targetNumber, body);
    }
  } catch (err) {
    console.error('[WhatsApp] Unexpected error:', err);
    return { success: false, message: 'WhatsApp sending failed unexpectedly', provider };
  }
}

// --- Message Templates ---

export function newEstimateWhatsApp(data: {
  name: string;
  phone: string;
  areaSqFt: number;
  floors: number;
  quality: string;
  minCost: number;
  maxCost: number;
}): string {
  const qualityLabel: Record<string, string> = {
    standard: 'Standard',
    premium: 'Premium',
    luxury: 'Luxury',
  };

  const totalArea = data.areaSqFt * data.floors;

  return [
    `*নতুন Cost Estimate Request!*`,
    ``,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Area: ${data.areaSqFt.toLocaleString()} sqft x ${data.floors} floor = *${totalArea.toLocaleString()} sqft*`,
    `Quality: ${qualityLabel[data.quality] || data.quality}`,
    `Estimate: *${formatBDT(data.minCost)} - ${formatBDT(data.maxCost)}*`,
    ``,
    `Time: ${nowBD()}`,
    ``,
    `Triple H Plandraft & Engineering`,
  ].join('\n');
}

export function newBookingWhatsApp(data: {
  name: string;
  phone: string;
  appointmentType: string;
  date: string;
  timeSlot?: string;
  location?: string;
}): string {
  const typeLabel: Record<string, string> = {
    'site-visit': 'Site Visit',
    'office-meeting': 'Office Meeting',
    'online-consultation': 'Online Consultation',
  };

  const dateFormatted = new Date(data.date).toLocaleDateString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const lines = [
    `*নতুন Appointment Booking!*`,
    ``,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Type: ${typeLabel[data.appointmentType] || data.appointmentType}`,
    `Date: *${dateFormatted}*`,
    `Time Slot: ${data.timeSlot || 'TBD'}`,
  ];

  if (data.location) lines.push(`Location: ${data.location}`);

  lines.push(``);
  lines.push(`Submitted: ${nowBD()}`);
  lines.push(``);
  lines.push(`Triple H Plandraft & Engineering`);

  return lines.join('\n');
}

// --- Client Confirmation Templates ---

export function clientEstimateConfirmWhatsApp(data: {
  name: string;
  minCost: number;
  maxCost: number;
  quality: string;
  totalArea: number;
}): string {
  const qualityLabel: Record<string, string> = {
    standard: 'Standard',
    premium: 'Premium',
    luxury: 'Luxury',
  };
  return [
    `প্রিয় ${data.name},`,
    ``,
    `আপনার *Cost Estimate* request পাওয়া গেছে ✅`,
    ``,
    `📐 মোট এলাকা: ${data.totalArea.toLocaleString()} sqft`,
    `🏗️ মান: ${qualityLabel[data.quality] || data.quality}`,
    `💰 আনুমানিক খরচ: *${formatBDT(data.minCost)} – ${formatBDT(data.maxCost)}*`,
    ``,
    `আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।`,
    ``,
    `ধন্যবাদ — *Triple H Plandraft & Engineering*`,
    `📞 01778-506500`,
  ].join('\n');
}

export function clientBookingConfirmWhatsApp(data: {
  name: string;
  appointmentType: string;
  date: string;
  timeSlot?: string;
}): string {
  const typeLabel: Record<string, string> = {
    'site-visit': 'Site Visit',
    'office-meeting': 'Office Meeting',
    'online-consultation': 'Online Consultation',
  };
  const dateFormatted = new Date(data.date).toLocaleDateString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return [
    `প্রিয় ${data.name},`,
    ``,
    `আপনার *Appointment* নিশ্চিত হয়েছে ✅`,
    ``,
    `🗓️ ধরন: ${typeLabel[data.appointmentType] || data.appointmentType}`,
    `📆 তারিখ: *${dateFormatted}*`,
    `⏰ সময়: ${data.timeSlot || 'TBD'}`,
    ``,
    `আমরা নির্ধারিত সময়ে আপনার সাথে যোগাযোগ করব।`,
    ``,
    `ধন্যবাদ — *Triple H Plandraft & Engineering*`,
    `📞 01778-506500`,
  ].join('\n');
}

export function clientWorkOrderConfirmWhatsApp(data: {
  name: string;
  projectTitle: string;
}): string {
  return [
    `প্রিয় ${data.name},`,
    ``,
    `আপনার *Work Order* request পাওয়া গেছে ✅`,
    ``,
    `🏗️ প্রজেক্ট: ${data.projectTitle}`,
    ``,
    `আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।`,
    ``,
    `ধন্যবাদ — *Triple H Plandraft & Engineering*`,
    `📞 01778-506500`,
  ].join('\n');
}

export function newWorkOrderWhatsApp(data: {
  name: string;
  phone: string;
  projectTitle: string;
  projectLocation: string;
  requirements: string;
  estimatedBudget?: string;
}): string {
  const lines = [
    `*নতুন Work Order Request!*`,
    ``,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Project: ${data.projectTitle}`,
    `Location: ${data.projectLocation}`,
  ];
  if (data.estimatedBudget) lines.push(`Budget: ${data.estimatedBudget}`);
  lines.push(`Requirements: ${data.requirements.substring(0, 200)}${data.requirements.length > 200 ? '...' : ''}`);
  lines.push(``);
  lines.push(`Submitted: ${nowBD()}`);
  lines.push(``);
  lines.push(`Triple H Plandraft & Engineering`);
  return lines.join('\n');
}

export function planStatusClientWhatsApp(data: {
  clientName: string;
  fileId: string;
  projectTitle: string;
  newStatus: string;
  note?: string;
}): string {
  const statusLabels: Record<string, string> = {
    submitted: 'জমা দেওয়া হয়েছে ✅',
    'under-review': 'পর্যালোচনাধীন 🔍',
    'revision-required': 'সংশোধন প্রয়োজন ⚠️',
    approved: 'অনুমোদিত হয়েছে 🎉',
    rejected: 'প্রত্যাখ্যাত ❌',
  };
  const statusLabel = statusLabels[data.newStatus] || data.newStatus;
  const lines = [
    `প্রিয় ${data.clientName},`,
    ``,
    `আপনার ফাইল "*${data.projectTitle}*" এর অবস্থা আপডেট হয়েছে 🔔`,
    ``,
    `নতুন অবস্থা: *${statusLabel}*`,
  ];
  if (data.note) lines.push(`মন্তব্য: ${data.note}`);
  lines.push(``);
  lines.push(`বিস্তারিত জানতে: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://triple-h-engineering.vercel.app'}/track-plan`);
  lines.push(``);
  lines.push(`ধন্যবাদ — *Triple H Plandraft & Engineering*`);
  return lines.join('\n');
}

export function dailySummaryWhatsApp(data: {
  date: string;
  inquiriesLast24h: number;
  bookingsLast24h: number;
  workOrdersLast24h: number;
  pageViewsLast24h: number;
  pendingInquiries: number;
  pendingBookings: number;
  pendingWorkOrders: number;
}): string {
  return [
    `📊 *Triple H — Daily Report*`,
    `📅 তারিখ: ${data.date}`,
    ``,
    `📈 *গত ২৪ ঘণ্টার একনজর:*`,
    `• নতুন Inquiry: *${data.inquiriesLast24h}* টি`,
    `• নতুন Appointment: *${data.bookingsLast24h}* টি`,
    `• নতুন Work Order: *${data.workOrdersLast24h}* টি`,
    `• Website Visitors: *${data.pageViewsLast24h.toLocaleString()}* বার`,
    ``,
    `⏳ *বর্তমানে পেন্ডিং আছে:*`,
    `• Pending Inquiries: *${data.pendingInquiries}*`,
    `• Pending Bookings: *${data.pendingBookings}*`,
    `• Pending Work Orders: *${data.pendingWorkOrders}*`,
    ``,
    `🌐 Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://triple-h-engineering.vercel.app'}/admin/dashboard`,
    ``,
    `Triple H Plandraft & Engineering`,
  ].join('\n');
}

export function newChatLeadWhatsApp(data: {
  phone: string;
  message: string;
}): string {
  return [
    `🤖 *নতুন AI ChatBot Lead!*`,
    ``,
    `📞 ফোন: *${data.phone}*`,
    `💬 ক্লায়েন্টের মেসেজ:`,
    `"${data.message}"`,
    ``,
    `⏰ সময়: ${nowBD()}`,
    ``,
    `Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://triple-h-engineering.vercel.app'}/admin/inquiries`,
    ``,
    `Triple H Plandraft & Engineering`,
  ].join('\n');
}

export function paymentReceiptWhatsApp(data: {
  clientName: string;
  projectTitle: string;
  installmentAmount: number;
  installmentType: string;
  totalAmount: number;
  totalPaid: number;
  dueAmount: number;
  note?: string;
}): string {
  const lines = [
    `🧾 *মানি রিসিট (Money Receipt)*`,
    `*Triple H Plandraft & Engineering*`,
    ``,
    `প্রিয় ${data.clientName},`,
    `আপনার পেমেন্ট সফলভাবে জমা হয়েছে ✅`,
    ``,
    `🏗️ প্রজেক্ট: *${data.projectTitle}*`,
    `💵 জমা কিস্তি: *${formatBDT(data.installmentAmount)}* (${data.installmentType})`,
    `💰 মোট চুক্তি: ${formatBDT(data.totalAmount)}`,
    `✅ মোট পরিশোধিত: *${formatBDT(data.totalPaid)}*`,
    `⏳ বর্তমান বকেয়া: *${formatBDT(data.dueAmount)}*`,
  ];
  if (data.note) lines.push(`📝 নোট: ${data.note}`);
  lines.push(``);
  lines.push(`তারিখ: ${nowBD()}`);
  lines.push(`📞 যেকোনো তথ্যে: 01778-506500`);
  lines.push(``);
  lines.push(`ধন্যবাদ আমাদের সাথে থাকার জন্য! 🙏`);
  return lines.join('\n');
}

export function newReviewAdminWhatsApp(data: {
  clientName: string;
  rating: number;
  content: string;
  designation?: string;
}): string {
  return [
    `⭐ *ওয়েবসাইটে নতুন Review জমা হয়েছে!*`,
    ``,
    `👤 নাম: *${data.clientName}* ${data.designation ? `(${data.designation})` : ''}`,
    `🌟 রেটিং: ${'⭐'.repeat(Math.max(1, Math.min(5, data.rating)))} (${data.rating}/5)`,
    `💬 মন্তব্য:`,
    `"${data.content}"`,
    ``,
    `⚠️ এটি বর্তমানে Pending আছে। অনুমোদন করতে ভিজিট করুন:`,
    `🌐 ${process.env.NEXT_PUBLIC_SITE_URL || 'https://triple-h-engineering.vercel.app'}/admin/testimonials`,
    ``,
    `Triple H Plandraft & Engineering`,
  ].join('\n');
}

export function newPaymentSubmissionWhatsApp(data: {
  clientName: string;
  phone: string;
  amount: number;
  method: string;
  senderPhone: string;
  transactionId: string;
  projectTitle?: string;
  planFileRef?: string;
}): string {
  const lines = [
    `🔔 *নতুন অনলাইন পেমেন্ট সাবমিশন!*`,
    `Triple H Engineering Consultancy`,
    ``,
    `👤 ক্লায়েন্ট: *${data.clientName}*`,
    `📞 ফোন: ${data.phone}`,
    `💰 পেমেন্টের পরিমাণ: *৳${data.amount.toLocaleString('en-BD')}*`,
    `💳 মাধ্যম: *${data.method.toUpperCase()}* (Sender: ${data.senderPhone})`,
    `🔖 ট্রানজেকশন আইডি (TrxID): *${data.transactionId}*`,
  ];
  if (data.projectTitle) lines.push(`🏗️ প্রজেক্ট: ${data.projectTitle}`);
  if (data.planFileRef) lines.push(`📁 ফাইল রেফারেন্স: ${data.planFileRef}`);
  lines.push(`⏰ সময়: ${nowBD()}`);
  lines.push(``);
  lines.push(`👉 যাচাই ও অনুমোদন করতে ভিজিট করুন:`);
  lines.push(`🌐 ${process.env.NEXT_PUBLIC_SITE_URL || 'https://triple-h-engineering.vercel.app'}/admin/payments`);
  return lines.join('\n');
}

export function inspectionReportWhatsApp(data: {
  clientName: string;
  reportNumber: string;
  projectTitle: string;
  stage: string;
  status: string;
  observations: string;
  instructions: string;
  nextVisitDate?: string;
}): string {
  const statusBangla: Record<string, string> = {
    satisfactory: "সন্তোষজনক (Satisfactory) ✅",
    "action-required": "সংশোধন প্রয়োজন (Action Required) ⚠️",
    rejected: "অননুমোদিত / পুনরায় কাজ আবশ্যক (Rejected) ❌",
  };

  const lines = [
    `🏗️ *সাইট পরিদর্শন ফিল্ড রিপোর্ট (Site Inspection Report)*`,
    `*Triple H Plandraft & Engineering*`,
    `রিপোর্ট নং: *${data.reportNumber}*`,
    ``,
    `প্রিয় ${data.clientName},`,
    `আপনার প্রজেক্ট "*${data.projectTitle}*" এ আজকের সাইট পরিদর্শন সম্পন্ন হয়েছে।`,
    ``,
    `🔍 কাজের ধাপ: *${data.stage}*`,
    `📊 পরিদর্শনের ফলাফল: *${statusBangla[data.status] || data.status}*`,
    ``,
    `📝 *মূল পর্যবেক্ষণ:*`,
    `${data.observations}`,
    ``,
    `👷 *কন্ট্রাক্টর/মিস্ত্রির জন্য জরুরি নির্দেশ:*`,
    `${data.instructions}`,
  ];

  if (data.nextVisitDate) {
    lines.push(``);
    lines.push(`📅 পরবর্তী সম্ভাব্য ভিজিট: *${data.nextVisitDate}*`);
  }

  lines.push(``);
  lines.push(`ইঞ্জিনিয়ার মোঃ হাসমত আলী (Managing Director)`);
  lines.push(`📞 যেকোনো প্রয়োজনে: 01778-506500`);

  return lines.join('\n');
}
