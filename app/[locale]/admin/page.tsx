import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authz';
import ConfirmSubmit from '@/app/components/ConfirmSubmit';
import { isAllowedOrigin } from '@/lib/csrf';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { logAdminAction } from '@/lib/audit';

async function deleteCourseAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/fa/auth/sign-in');
  }
  if (!isAllowedOrigin()) {
    return;
  }
  if (!id) return;
  await prisma.course.delete({ where: { id } });
  await logAdminAction({ userId: admin.id, action: 'DELETE', entity: 'Course', entityId: id });
  revalidatePath('/fa/admin');
  revalidatePath('/en/admin');
}

export default async function AdminPage({ params, searchParams }: { params: { locale: string }, searchParams?: Record<string, string | string[] | undefined> }) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect(`/${params.locale}/auth/sign-in?callbackUrl=/${params.locale}/admin`);
  }
  const parseIntSafe = (v: unknown, def: number) => {
    const n = typeof v === 'string' ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  const page = parseIntSafe(searchParams?.page, 1);
  const sizeRaw = parseIntSafe(searchParams?.size, 10);
  const size = Math.min(50, Math.max(1, sizeRaw));
  const allowedSort = new Set(['title', 'price', 'published', 'createdAt']);
  const sortParam = typeof searchParams?.sort === 'string' ? searchParams?.sort : 'createdAt';
  const sort = allowedSort.has(sortParam) ? sortParam : 'createdAt';
  const dirParam = (typeof searchParams?.dir === 'string' ? searchParams?.dir : 'desc') as string;
  const dir = dirParam === 'asc' || dirParam === 'desc' ? (dirParam as 'asc' | 'desc') : 'desc';
  const orderBy: any = ['title', 'price', 'published', 'createdAt'].includes(sort) ? { [sort]: dir } : { createdAt: 'desc' };
  const [total, courses] = await Promise.all([
    prisma.course.count(),
    prisma.course.findMany({
      include: { category: true, instructor: true },
      orderBy,
      skip: (page - 1) * size,
      take: size,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / size));
  const t = (k: string) => (params.locale === 'fa' ? ({ admin: 'پیشخوان مدیریت', manageCategories: 'مدیریت دسته‌بندی‌ها', newCourse: 'دوره جدید', title: 'عنوان', category: 'دسته‌بندی', price: 'قیمت', published: 'منتشر', actions: 'عملیات', edit: 'ویرایش', delConfirm: 'آیا از حذف این دوره مطمئن هستید؟', del: 'حذف' } as any)[k] : ({ admin: 'Admin dashboard', manageCategories: 'Manage categories', newCourse: 'New course', title: 'Title', category: 'Category', price: 'Price', published: 'Published', actions: 'Actions', edit: 'Edit', delConfirm: 'Are you sure you want to delete this course?', del: 'Delete' } as any)[k]);
  const buildQS = (patch: Record<string, string | number>) => {
    const sp = new URLSearchParams();
    sp.set('page', String(page));
    sp.set('size', String(size));
    sp.set('sort', sort);
    sp.set('dir', dir);
    for (const [k, v] of Object.entries(patch)) sp.set(k, String(v));
    return sp.toString();
  };
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('admin')}</h1>
        <div className="space-x-3">
          <Link className="underline" href={`/${params.locale}/admin/categories`}>{t('manageCategories')}</Link>
          <Link className="px-3 py-2 bg-blue-600 text-white rounded" href={`/${params.locale}/admin/courses/new`}>{t('newCourse')}</Link>
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2"><Link href={`/${params.locale}/admin?${buildQS({ sort: 'title', dir: sort === 'title' && dir === 'asc' ? 'desc' : 'asc' })}`}>{t('title')}</Link></th>
            <th className="py-2">{t('category')}</th>
            <th className="py-2"><Link href={`/${params.locale}/admin?${buildQS({ sort: 'price', dir: sort === 'price' && dir === 'asc' ? 'desc' : 'asc' })}`}>{t('price')}</Link></th>
            <th className="py-2"><Link href={`/${params.locale}/admin?${buildQS({ sort: 'published', dir: sort === 'published' && dir === 'asc' ? 'desc' : 'asc' })}`}>{t('published')}</Link></th>
            <th className="py-2">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.title}</td>
              <td className="py-2">{c.category?.name}</td>
              <td className="py-2">${'{'}c.price.toString(){'}'}</td>
              <td className="py-2">{c.published ? 'Yes' : 'No'}</td>
              <td className="py-2 space-x-2">
                <Link className="underline" href={`/${params.locale}/admin/courses/${c.id}`}>{t('edit')}</Link>
                <form action={deleteCourseAction} className="inline">
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmit message={t('delConfirm')}>
                    <span className="text-red-600 underline cursor-pointer">{t('del')}</span>
                  </ConfirmSubmit>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">
        <div>
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
        </div>
        <div className="space-x-2">
          {page > 1 && (
            <Link className="px-3 py-1 border rounded" href={`/${params.locale}/admin?${buildQS({ page: page - 1 })}`}>
              Prev
            </Link>
          )}
          {page < totalPages && (
            <Link className="px-3 py-1 border rounded" href={`/${params.locale}/admin?${buildQS({ page: page + 1 })}`}>
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
