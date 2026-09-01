import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import dbConnect from '@/lib/db';
import PageView from '@/models/pageview.model';

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json();
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const ipRaw =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const ipHash = createHash('sha256').update(ipRaw).digest('hex');

    await dbConnect();
    await PageView.create({
      path,
      referrer: referrer || '',
      userAgent: req.headers.get('user-agent') || '',
      ip: ipHash,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics Track Error:', error);
    return NextResponse.json({ error: 'Failed to track page view' }, { status: 500 });
  }
}
