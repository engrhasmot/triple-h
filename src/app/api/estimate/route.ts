import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/inquiry.model';
import { costEstimatorSchema, phoneSchema } from '@/lib/validators';
import { sendEmail } from '@/lib/email';
import { newInquiryEmail } from '@/lib/email-templates';

const RATES = {
  standard: { base: 1800, label: 'Standard' },
  premium: { base: 2200, label: 'Premium' },
  luxury: { base: 2800, label: 'Luxury' },
};

// Breakdown percentages
const BREAKDOWN = {
  civil: 0.45,
  finishing: 0.35,
  electrical: 0.12,
  fees: 0.08,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, areaSqFt, floors, quality } = body;

    if (!name || !phone || !areaSqFt || !floors || !quality) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const phoneParsed = phoneSchema.safeParse(phone);
    if (!phoneParsed.success) {
      return NextResponse.json(
        { error: phoneParsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    if (!RATES[quality as keyof typeof RATES]) {
      return NextResponse.json({ error: 'Invalid quality selection' }, { status: 400 });
    }

    const parsed = costEstimatorSchema.safeParse({ area: Number(areaSqFt), floors: Number(floors), quality });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    const rate = RATES[quality as keyof typeof RATES].base;
    const totalArea = Number(areaSqFt) * Number(floors);
    const estimatedCost = totalArea * rate;
    const minCost = Math.round(estimatedCost * 0.93);
    const maxCost = Math.round(estimatedCost * 1.07);

    const breakdown = {
      civil: {
        label: 'Civil Structure & Foundation',
        percentage: 45,
        min: Math.round(minCost * BREAKDOWN.civil),
        max: Math.round(maxCost * BREAKDOWN.civil),
      },
      finishing: {
        label: 'Finishing Works (Tiles, Paint, Doors/Windows)',
        percentage: 35,
        min: Math.round(minCost * BREAKDOWN.finishing),
        max: Math.round(maxCost * BREAKDOWN.finishing),
      },
      electrical: {
        label: 'Plumbing & Electrical',
        percentage: 12,
        min: Math.round(minCost * BREAKDOWN.electrical),
        max: Math.round(maxCost * BREAKDOWN.electrical),
      },
      fees: {
        label: 'Architecture, Engineering & Supervision',
        percentage: 8,
        min: Math.round(minCost * BREAKDOWN.fees),
        max: Math.round(maxCost * BREAKDOWN.fees),
      },
    };

    await dbConnect();

    const inquiry = await Inquiry.create({
      name,
      phone: phoneParsed.data,
      serviceType: 'cost-estimator',
      message: `Cost Estimate: ${totalArea} sq ft, ${floors} floor(s), ${quality}. Range: BDT ${minCost.toLocaleString()} - ${maxCost.toLocaleString()}`,
      projectArea: totalArea,
      source: 'website',
      status: 'new',
      notes: `Quality: ${quality} | Rate: ${rate}/sqft | Breakdown: Civil ${breakdown.civil.min}-${breakdown.civil.max}, Finishing ${breakdown.finishing.min}-${breakdown.finishing.max}, Electrical ${breakdown.electrical.min}-${breakdown.electrical.max}, Fees ${breakdown.fees.min}-${breakdown.fees.max}`,
    });

    sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@tripleh.com.bd',
      ...newInquiryEmail({
        name,
        phone,
        email: body.email,
        serviceType: 'cost-estimator',
        message: `Cost Estimate: ${totalArea} sq ft, ${floors} floor(s), ${quality}. Range: BDT ${minCost.toLocaleString()} - ${maxCost.toLocaleString()}`,
      }),
    }).catch(err => console.error('Email notification failed:', err));

    return NextResponse.json(
      {
        success: true,
        data: {
          inquiryId: inquiry._id,
          totalArea,
          floors: Number(floors),
          areaPerFloor: Number(areaSqFt),
          quality,
          rate,
          minCost,
          maxCost,
          breakdown,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Estimate API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate estimate or save lead' },
      { status: 500 }
    );
  }
}
