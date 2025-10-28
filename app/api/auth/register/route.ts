import { NextResponse } from 'next/server';
import { defaultRegisterLimiter } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  // Simple per-IP rate limiting (MVP)
  const ipHeader = req.headers.get('x-forwarded-for') || ''
  const ip = ipHeader.split(',')[0]?.trim() || 'unknown'
  const rl = defaultRegisterLimiter.check(ip)
  if (!rl.allowed) {
    const res = NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    res.headers.set('RateLimit-Limit', '5')
    res.headers.set('RateLimit-Remaining', String(rl.remaining))
    res.headers.set('RateLimit-Reset', String(Math.ceil(rl.resetAt / 1000)))
    return res
  }
  try {
    const body = await req.json();
    const { email, name, password } = body ?? {};
    if (!email || !name || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, name, passwordHash } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
