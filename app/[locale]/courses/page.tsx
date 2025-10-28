import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import CourseCard from '@/app/components/CourseCard';
import CourseFilters from '@/app/components/CourseFilters';
import Link from 'next/link';

export default async function CoursesListPage({ params, searchParams }: { params: { locale: 'fa' | 'en' }, searchParams?: Record<string, string | string[] | undefined> }) {
  const locale = params.locale;
  const isFa = locale === 'fa';

  const parseIntSafe = (v: unknown, def: number) => {
    const n = typeof v === 'string' ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  const page = parseIntSafe(searchParams?.page, 1);
  const sizeRaw = parseIntSafe(searchParams?.size, 12);
  const size = Math.min(48, Math.max(1, sizeRaw));
  const sortAllowed = new Set(['title', 'price', 'createdAt']);
  const sort = typeof searchParams?.sort === 'string' && sortAllowed.has(searchParams.sort) ? (searchParams.sort as string) : 'createdAt';
  const dirParam = (typeof searchParams?.dir === 'string' ? searchParams.dir : 'desc') as string;
  const dir = dirParam === 'asc' || dirParam === 'desc' ? (dirParam as 'asc' | 'desc') : 'desc';

  const q = typeof searchParams?.q === 'string' ? searchParams.q.trim() : '';
  const category = typeof searchParams?.category === 'string' ? searchParams.category : '';
  const level = typeof searchParams?.level === 'string' ? searchParams.level : '';
  const language = typeof searchParams?.language === 'string' ? searchParams.language : '';
  const min = typeof searchParams?.min === 'string' ? searchParams.min.replace(/\s+/g, '').replace(',', '.') : '';
  const max = typeof searchParams?.max === 'string' ? searchParams.max.replace(/\s+/g, '').replace(',', '.') : '';

  const where: any = { published: true };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (category) where.categoryId = category;
  if (level) where.level = level;
  if (language) where.language = language;
  if (/^\d+(\.\d{1,2})?$/.test(min)) where.price = { ...(where.price || {}), gte: new Prisma.Decimal(min) };
  if (/^\d+(\.\d{1,2})?$/.test(max)) where.price = { ...(where.price || {}), lte: new Prisma.Decimal(max) };

  const orderBy: any = { [sort]: dir };

  const [categories, total, courses] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy,
      skip: (page - 1) * size,
      take: size,
      include: { category: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / size));

  const buildQS = (patch: Record<string, string | number>) => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (category) sp.set('category', category);
    if (level) sp.set('level', level);
    if (language) sp.set('language', language);
    if (min) sp.set('min', min);
    if (max) sp.set('max', max);
    sp.set('page', String(page));
    sp.set('size', String(size));
    sp.set('sort', String(sort));
    sp.set('dir', String(dir));
    for (const [k, v] of Object.entries(patch)) sp.set(k, String(v));
    return sp.toString();
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">{isFa ? 'دوره‌ها' : 'Courses'}</h1>
      <div className="mb-6">
        <CourseFilters locale={locale} categories={categories} />
      </div>
      {courses.length === 0 ? (
        <p className="text-gray-600">{isFa ? 'نتیجه‌ای یافت نشد.' : 'No results found.'}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} locale={locale} course={{ id: c.id, slug: (c as any).slug, title: c.title, price: c.price.toString(), mediaUrl: (c as any).mediaUrl, category: { name: c.category?.name || '' }, level: (c as any).level || null, language: (c as any).language || null }} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-6">
        <div>
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
        </div>
        <div className="space-x-2">
          {page > 1 && (
            <Link className="px-3 py-1 border rounded" href={`/${locale}/courses?${buildQS({ page: page - 1 })}`}>
              Prev
            </Link>
          )}
          {page < totalPages && (
            <Link className="px-3 py-1 border rounded" href={`/${locale}/courses?${buildQS({ page: page + 1 })}`}>
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
