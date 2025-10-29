import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Basic per-user rate limit to reduce spam (5 requests/min)
  const allowed = rateLimit(user.id, 5, 60_000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const course = await prisma.course.findUnique({ where: { id: params.courseId } });
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const enrolled = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } });
  if (!enrolled) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const rating = Number(body?.rating);
  const comment: string | undefined = body?.comment ? String(body.comment) : undefined;
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }

  // One review per user/course: upsert via composite unique key
  try {
    const review = await prisma.review.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      update: { rating, comment },
      create: { rating, comment, userId: user.id, courseId: course.id },
    });
    return NextResponse.json({ ok: true, review });
  } catch (err: any) {
    // Surface duplicate review constraints as a clear error
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'You have already reviewed this course.' }, { status: 409 });
    }
    throw err;
  }
}

export async function GET(_req: NextRequest, { params }: { params: { courseId: string } }) {
  const reviews = await prisma.review.findMany({
    where: { courseId: params.courseId },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  } as any);
  return NextResponse.json({ reviews });
}
