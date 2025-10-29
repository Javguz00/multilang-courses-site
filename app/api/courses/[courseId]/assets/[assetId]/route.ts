import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { courseId: string, assetId: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.email) return NextResponse.redirect(new URL(`/en/auth/sign-in`, req.url));
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.redirect(new URL(`/en/auth/sign-in`, req.url));

  const course = await prisma.course.findUnique({ where: { id: params.courseId } });
  if (!course) return new NextResponse('Not found', { status: 404 });

  const enrolled = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } });
  if (!enrolled) return new NextResponse('Forbidden', { status: 403 });

  const asset = await prisma.courseAsset.findUnique({ where: { id: params.assetId } });
  if (!asset || asset.courseId !== course.id) return new NextResponse('Not found', { status: 404 });

  const url = asset.url as string;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Temporary redirect to asset URL. In production, prefer signed URLs or private storage access.
    return NextResponse.redirect(url, { status: 302 });
  }
  // Local file serving not implemented in this demo
  return new NextResponse('Not implemented for local files', { status: 501 });
}
