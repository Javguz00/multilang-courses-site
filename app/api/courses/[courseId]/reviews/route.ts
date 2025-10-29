import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  // One review per user/course: upsert
  const review = await prisma.review.upsert({
    where: { // unique compound not defined; emulate with find then update/create
      id: (
        (await prisma.review.findFirst({ where: { userId: user.id, courseId: course.id } }))?.id || '___none___'
      ),
    },
    update: { rating, comment },
    create: { rating, comment, userId: user.id, courseId: course.id },
  } as any);

  return NextResponse.json({ ok: true, review });
}

export async function GET(_req: NextRequest, { params }: { params: { courseId: string } }) {
  const reviews = await prisma.review.findMany({
    where: { courseId: params.courseId },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  } as any);
  return NextResponse.json({ reviews });
}
