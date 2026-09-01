import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PlanStatus from '@/models/plan-status.model';

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Please provide a File ID or Phone Number' },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Search query is too long' },
        { status: 400 }
      );
    }

    await dbConnect();

    const cleanQuery = query.replace(/[\s-]/g, '');
    const isPhone = /^(?:\+?880)?\d{10,11}$/.test(cleanQuery);

    if (isPhone) {
      // Return ALL plans for this phone number, newest first
      const plans = await PlanStatus.find({
        phone: { $regex: new RegExp(escapeRegExp(cleanQuery) + '$') },
      })
        .sort({ createdAt: -1 })
        .lean();

      if (!plans || plans.length === 0) {
        return NextResponse.json(
          { error: 'No records found for this phone number' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: plans, multiple: plans.length > 1 });
    }

    // File ID: exact match (case insensitive)
    const planData = await PlanStatus.findOne({
      fileId: { $regex: new RegExp(`^${escapeRegExp(query)}$`, 'i') },
    }).lean();

    if (!planData) {
      return NextResponse.json(
        { error: 'No records found for the provided File ID' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: [planData], multiple: false });
  } catch (error: any) {
    console.error('Plan Tracking API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}
