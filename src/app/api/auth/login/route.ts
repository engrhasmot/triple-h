import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/user.model';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Simple in-memory rate limiter (per IP). Suitable for single-instance deployments.
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await dbConnect();

    let user = await User.findOne({ email }).select('+password');
    console.log("LOGIN DB USER:", user ? user.email : "Not found");

    if (!user) {
      if (!ADMIN_EMAIL || email !== ADMIN_EMAIL) {
        console.log("LOGIN FAIL: email mismatch", { provided: email, ADMIN_EMAIL });
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      if (!ADMIN_PASSWORD_HASH) {
        throw new Error('ADMIN_PASSWORD_HASH is not configured.');
      }
      if (!ADMIN_PASSWORD_HASH.startsWith('$2')) {
        throw new Error('ADMIN_PASSWORD_HASH must be a bcrypt hash.');
      }

      const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      console.log("LOGIN BCRYPT ENV MATCH:", isMatch);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      user = await User.create({
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD_HASH,
        role: 'admin',
        isActive: true,
      });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("LOGIN BCRYPT DB MATCH:", isMatch);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      if (!user.isActive) {
        return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
      }

      user.lastLogin = new Date();
      await user.save();
    }

    const token = await signToken({ email: user.email, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
