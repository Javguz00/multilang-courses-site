import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

export type CourseCardProps = {
  locale: 'fa' | 'en';
  course: {
    id: string;
    slug: string;
    title: string;
    price: string;
    mediaUrl?: string | null;
    category?: { name: string } | null;
    level?: string | null;
    language?: string | null;
  };
};

export default function CourseCard({ locale, course }: CourseCardProps) {
  const isFa = locale === 'fa';
  return (
    <div className="border rounded-lg overflow-hidden flex flex-col">
      {course.mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={course.mediaUrl} alt={course.title} className="aspect-video object-cover" loading="lazy" decoding="async" />
      ) : (
        <div className="aspect-video bg-gray-100" />
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-2 mb-1">{course.title}</h3>
        <div className="text-xs text-gray-600 mb-2 flex items-center gap-2">
          {course.category?.name && <span>{course.category.name}</span>}
          {course.level && <span>• {course.level}</span>}
          {course.language && <span>• {course.language}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-medium">{formatPrice(course.price as any, locale)}</span>
          <Link className="text-blue-600 underline" href={`/${locale}/courses/${course.slug}`}>
            {isFa ? 'مشاهده' : 'View'}
          </Link>
        </div>
      </div>
    </div>
  );
}
