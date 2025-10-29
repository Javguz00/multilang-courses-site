import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function LearnPage({ params }: { params: { locale: 'fa' | 'en', slug: string } }) {
  const locale = params.locale;
  const isFa = locale === 'fa';
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/courses/${params.slug}/learn`);
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/courses/${params.slug}/learn`);

  const course = await prisma.course.findFirst({ where: { slug: params.slug, published: true } });
  if (!course) notFound();

  const enrolled = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } });
  if (!enrolled) redirect(`/${locale}/courses/${params.slug}?err=need_enrollment`);

  const assets = await prisma.courseAsset.findMany({ where: { courseId: course.id }, orderBy: { createdAt: 'asc' } });

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">{isFa ? 'یادگیری' : 'Course Content'} — {course.title}</h1>
      {assets.length === 0 && !course.mediaUrl ? (
        <div className="text-gray-600">{isFa ? 'محتوای دوره هنوز اضافه نشده است.' : 'No course content added yet.'}</div>
      ) : (
        <div className="space-y-6">
          {course.mediaUrl ? (
            <div>
              <h2 className="font-medium mb-2">{isFa ? 'ویدئو' : 'Video'}</h2>
              {/* Using a direct URL; prefer signed URLs in production */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video className="w-full rounded" src={course.mediaUrl} controls preload="metadata" />
            </div>
          ) : null}
          {assets.map((a) => (
            <div key={a.id} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-gray-600">{a.kind}</div>
                </div>
                <a className="px-3 py-1.5 bg-blue-600 text-white rounded" href={`/api/courses/${course.id}/assets/${a.id}`}>
                  {a.kind === 'VIDEO' ? (isFa ? 'مشاهده' : 'Open') : (isFa ? 'دانلود' : 'Download')}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
