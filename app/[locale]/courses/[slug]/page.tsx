import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function CourseDetailPage({ params }: { params: { locale: 'fa' | 'en', slug: string } }) {
  const locale = params.locale;
  const isFa = locale === 'fa';
  const course = (await prisma.course.findFirst({
    where: ({ slug: params.slug } as any),
    include: ({ category: true, instructor: true } as any),
  })) as any;
  if (!course || !course.published) {
    redirect(`/${locale}/courses`);
  }
  return (
    <div className="container py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-semibold mb-2">{course.title}</h1>
          <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
            {course?.category?.name && <span>{course.category.name}</span>}
            {course?.level && <span>• {course.level}</span>}
            {course?.language && <span>• {course.language}</span>}
          </div>
          { course?.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.mediaUrl} alt={course.title} className="w-full rounded mb-4" />
          ) : null }
          <p className="mb-6 whitespace-pre-line">{course.description}</p>
          {course?.syllabus && (
            <div>
              <h2 className="text-xl font-semibold mb-2">{isFa ? 'سرفصل دوره' : 'Syllabus'}</h2>
              <div className="prose max-w-none whitespace-pre-line">{course.syllabus}</div>
            </div>
          )}
        </div>
        <aside className="lg:col-span-1">
          <div className="border rounded p-4 sticky top-24">
            <div className="text-2xl font-semibold mb-2">${'{'}course.price.toString(){'}'}</div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded">{isFa ? 'ثبت‌نام' : 'Enroll'}</button>
            <div className="text-xs text-gray-600 mt-3">
              {isFa ? 'مدرس' : 'Instructor'}: {course?.instructor?.name || course?.instructor?.email}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
