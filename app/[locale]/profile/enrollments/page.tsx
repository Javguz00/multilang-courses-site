import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function EnrollmentsPage({ params }: { params: { locale: 'fa' | 'en' } }) {
  const locale = params.locale;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/profile/enrollments`);
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { createdAt: 'desc' }
  });

  const t = (fa: string, en: string) => (locale === 'fa' ? fa : en);

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold mb-6">{t('دوره‌های من', 'My Courses')}</h1>
      {enrollments.length === 0 ? (
        <p className="text-gray-600">{t('هنوز دوره‌ای ثبت‌نام نکرده‌اید.', 'You have no enrollments yet.')}</p>
      ) : (
        <ul className="space-y-4">
          {enrollments.map((enr: any) => (
            <li key={enr.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{enr.course.title}</p>
                <p className="text-sm text-gray-600">{t('ثبت‌نام در', 'Enrolled on')}: {new Date(enr.createdAt).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}</p>
              </div>
              <a href={`/${locale}/courses/${enr.course.slug}`} className="text-blue-600 hover:underline">
                {t('مشاهده دوره', 'View course')}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
