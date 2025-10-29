import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReviewForm } from '@/app/components/ReviewForm';

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
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const alreadyEnrolled = userId
    ? !!(await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } }))
    : false;
  const reviews = await prisma.review.findMany({ where: { courseId: course.id }, include: { user: true }, orderBy: { createdAt: 'desc' } } as any);
  const avgRating = reviews.length ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;

  return (
    <div className="container py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-semibold mb-2">{course.title}</h1>
          <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
            {course?.category?.name && <span>{course.category.name}</span>}
            {course?.level && <span>• {course.level}</span>}
            {course?.language && <span>• {course.language}</span>}
            {avgRating ? <span>• ⭐ {avgRating}/5</span> : null}
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
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">{isFa ? 'نظرات' : 'Reviews'}</h2>
            {alreadyEnrolled && (
              <ReviewForm courseId={course.id} locale={locale} />
            )}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-gray-600 text-sm">{isFa ? 'هنوز نظری ثبت نشده است.' : 'No reviews yet.'}</div>
              ) : reviews.map((r: any) => (
                <div key={r.id} className="border rounded p-3">
                  <div className="text-sm">⭐ {r.rating}/5 — {r.user?.name || r.user?.email}</div>
                  {r.comment && <div className="text-sm mt-1">{r.comment}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="lg:col-span-1">
          <div className="border rounded p-4 sticky top-24">
            <div className="text-2xl font-semibold mb-2">{formatPrice(course.price.toString(), locale)}</div>
            {alreadyEnrolled ? (
              <div className="text-green-700 font-medium">
                {isFa ? 'شما در این دوره ثبت‌نام کرده‌اید.' : 'You are already enrolled in this course.'}
              </div>
            ) : (
              <form action={async () => { 'use server';
                const { addToCart } = await import('@/lib/cart');
                addToCart(course.id, 1);
              }}>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded" type="submit">{isFa ? 'افزودن به سبد' : 'Add to cart'}</button>
              </form>
            )}
            {alreadyEnrolled && (
              <a className="mt-3 inline-block w-full text-center px-4 py-2 bg-emerald-600 text-white rounded" href={`/${locale}/courses/${course.slug}/learn`}>
                {isFa ? 'ورود به محتوای دوره' : 'Go to course content'}
              </a>
            )}
            <div className="text-xs text-gray-600 mt-3">
              {isFa ? 'مدرس' : 'Instructor'}: {course?.instructor?.name || course?.instructor?.email}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
