/**
 * SMS Notification Library
 * 
 * Supports:
 *  - Console logging (fallback / development)
 *  - SSL Wireless (Bangladesh) — set SMS_PROVIDER=ssl-wireless
 *  - Twilio — set SMS_PROVIDER=twilio
 * 
 * Required env vars (per provider):
 *  SSL Wireless: SMS_API_KEY, SMS_SENDER_ID, SMS_API_URL
 *  Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 */

export interface SMSResult {
  success: boolean;
  message: string;
  provider: string;
}

/**
 * Normalize BD phone numbers to international format for SMS gateways.
 * e.g. 01711223344 → 8801711223344
 */
function normalizeBDPhone(phone: string): string {
  const clean = phone.replace(/[\s\-()]/g, '');
  if (clean.startsWith('+88')) return clean.slice(1); // remove +
  if (clean.startsWith('88')) return clean;
  if (clean.startsWith('0')) return '88' + clean.slice(1);
  return '88' + clean;
}

async function sendSSLWireless(to: string, message: string): Promise<SMSResult> {
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID || 'TRIPLEH';
  const apiUrl = process.env.SMS_API_URL || 'https://api.sslcommerz.com/sms/v1/send';

  if (!apiKey) {
    console.warn('[SMS] SSL Wireless: SMS_API_KEY not set, falling back to console.');
    return sendConsoleFallback(to, message);
  }

  const normalized = normalizeBDPhone(to);
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, sender_id: senderId, to: normalized, message }),
  });

  const data = await response.json();
  if (response.ok && data.status === 'success') {
    console.log(`[SMS] Sent via SSL Wireless to ${normalized}`);
    return { success: true, message: 'SMS sent via SSL Wireless', provider: 'ssl-wireless' };
  }

  console.error('[SMS] SSL Wireless error:', data);
  return { success: false, message: data?.error || 'SMS failed', provider: 'ssl-wireless' };
}

async function sendTwilio(to: string, message: string): Promise<SMSResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !authToken || !from) {
    console.warn('[SMS] Twilio: credentials not set, falling back to console.');
    return sendConsoleFallback(to, message);
  }

  const normalized = '+' + normalizeBDPhone(to);
  const credentials = Buffer.from(`${sid}:${authToken}`).toString('base64');
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

  const body = new URLSearchParams({ To: normalized, From: from, Body: message });
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json();
  if (response.ok) {
    console.log(`[SMS] Sent via Twilio to ${normalized}: ${data.sid}`);
    return { success: true, message: 'SMS sent via Twilio', provider: 'twilio' };
  }

  console.error('[SMS] Twilio error:', data);
  return { success: false, message: data?.message || 'SMS failed', provider: 'twilio' };
}

function sendConsoleFallback(to: string, message: string): SMSResult {
  console.log(`\n📱 [SMS NOTIFICATION — Console Fallback]`);
  console.log(`   To: ${to}`);
  console.log(`   Message:\n${message}\n`);
  return { success: true, message: 'SMS logged to console (dev mode)', provider: 'console' };
}

/**
 * Main SMS sender — picks provider from SMS_PROVIDER env var.
 * Defaults to console fallback in development.
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  const provider = process.env.SMS_PROVIDER || 'console';

  try {
    switch (provider) {
      case 'ssl-wireless':
        return await sendSSLWireless(to, message);
      case 'twilio':
        return await sendTwilio(to, message);
      default:
        return sendConsoleFallback(to, message);
    }
  } catch (err) {
    console.error('[SMS] Unexpected error:', err);
    return { success: false, message: 'SMS sending failed unexpectedly', provider };
  }
}

// ─── Bengali SMS Message Templates ──────────────────────────────────────────

export function planStatusUpdateSMS(data: {
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

  let msg = `প্রিয় ${data.clientName},\n`;
  msg += `আপনার ফাইল "${data.projectTitle}" (ID: ${data.fileId}) এর অবস্থা আপডেট হয়েছে:\n\n`;
  msg += `নতুন অবস্থা: ${statusLabel}\n`;
  if (data.note) msg += `মন্তব্য: ${data.note}\n`;
  msg += `\nবিস্তারিত জানতে: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/track-plan\n`;
  msg += `Triple H Plandraft & Engineering`;

  return msg;
}

export function appointmentConfirmSMS(data: {
  clientName: string;
  date: string;
  time?: string;
}): string {
  return `প্রিয় ${data.clientName},\nআপনার অ্যাপয়েন্টমেন্ট ${data.date}${data.time ? ' সকাল ' + data.time : ''} নিশ্চিত করা হয়েছে।\nধন্যবাদ - Triple H Plandraft & Engineering`;
}
