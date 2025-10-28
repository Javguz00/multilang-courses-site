import { prisma } from '@/lib/prisma';
import CourseCard from '../components/CourseCard';
import Link from 'next/link';

export default async function HomePage({ params }: { params: { locale: 'fa' | 'en' } }) {
  const locale = params.locale;
  const isFa = locale === 'fa';
  const featured = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { category: true },
  });
  return (
    <div className="container py-8">
      <section className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">{isFa ? 'دوره‌های پیشنهادی' : 'Featured courses'}</h1>
        <p className="text-gray-600 mb-4">{isFa ? 'بهترین دوره‌ها برای شروع یادگیری' : 'Get started with our popular picks'}</p>
        {featured.length === 0 ? (
          <p className="text-gray-600">{isFa ? 'دوره‌ای یافت نشد.' : 'No courses yet.'}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CourseCard key={c.id} locale={locale} course={{ id: c.id, slug: (c as any).slug, title: c.title, price: c.price.toString(), mediaUrl: (c as any).mediaUrl, category: { name: c.category.name }, level: (c as any).level || null, language: (c as any).language || null }} />
            ))}
          </div>
        )}
      </section>
      <div className="mt-6">
        <Link className="px-4 py-2 bg-blue-600 text-white rounded" href={`/${locale}/courses`}>
          {isFa ? 'مشاهده همه دوره‌ها' : 'Browse all courses'}
        </Link>
      </div>
    </div>
  );
}
