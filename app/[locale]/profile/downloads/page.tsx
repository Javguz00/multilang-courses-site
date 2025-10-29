import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function DownloadsPage({ params }: { params: { locale: 'fa' | 'en' } }) {
  const locale = params.locale;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/profile/downloads`);
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/profile/downloads`);

  // Fetch all assets for user's enrolled courses
  const enrollments = await prisma.enrollment.findMany({ where: { userId: user.id } });
  const courseIds = enrollments.map((e) => e.courseId);
  let assets: { id: string; title: string; kind: string; url: string; courseId: string; course?: { title: string } }[] = [];
  if (courseIds.length) {
    assets = await prisma.courseAsset.findMany({
      where: { courseId: { in: courseIds } },
      orderBy: { createdAt: 'desc' },
      include: { course: true },
    });
  }

  const isFa = locale === 'fa';
  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold mb-6">{isFa ? 'دانلودها' : 'Downloads'}</h1>
      {assets.length === 0 ? (
        <div className="text-gray-600">{isFa ? 'فایلی برای دانلود موجود نیست.' : 'No files available for download yet.'}</div>
      ) : (
        <div className="space-y-3">
          {assets.map((a) => (
            <div key={a.id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-gray-600">{a.course?.title}</div>
              </div>
              <a className="px-3 py-1.5 bg-blue-600 text-white rounded" href={`/api/courses/${a.courseId}/assets/${a.id}`}>
                {isFa ? 'دانلود' : 'Download'}
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
