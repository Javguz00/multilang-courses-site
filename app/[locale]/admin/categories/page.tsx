import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authz';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { categorySchema, type FieldErrors } from '@/lib/validation';
import { CreateCategoryForm, UpdateCategoryForm } from '@/app/components/forms/CategoryForms';
import ConfirmSubmit from '@/app/components/ConfirmSubmit';
import { isAllowedOrigin } from '@/lib/csrf';
import { logAdminAction } from '@/lib/audit';

type CategoryState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors<{ name: string; slug: string }>;
};

async function createCategoryAction(_state: CategoryState, formData: FormData): Promise<CategoryState> {
  'use server';
  const admin = await requireAdmin();
  if (!admin) return { message: 'Unauthorized' };
  const raw = {
    name: String(formData.get('name') || ''),
    slug: String(formData.get('slug') || ''),
  };
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    const errors: FieldErrors<any> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      errors[key as any] = issue.message;
    }
    return { errors };
  }
  try {
    const created = await prisma.category.create({ data: { name: parsed.data.name.trim(), slug: parsed.data.slug.trim() } });
    await logAdminAction({ userId: admin.id, action: 'CREATE', entity: 'Category', entityId: created.id, meta: { name: created.name, slug: created.slug } });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return { message: 'Duplicate value', errors: { slug: 'Slug already exists' } };
    }
    return { message: 'Server error' };
  }
  revalidatePath('/fa/admin/categories');
  revalidatePath('/en/admin/categories');
  return { ok: true };
}

async function updateCategoryAction(_state: CategoryState, formData: FormData): Promise<CategoryState> {
  'use server';
  const admin = await requireAdmin();
  if (!admin) return { message: 'Unauthorized' };
  const id = String(formData.get('id') || '');
  const raw = {
    name: String(formData.get('name') || ''),
    slug: String(formData.get('slug') || ''),
  };
  if (!id) return { message: 'Invalid request' };
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    const errors: FieldErrors<any> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      errors[key as any] = issue.message;
    }
    return { errors };
  }
  try {
    const updated = await prisma.category.update({ where: { id }, data: { name: parsed.data.name.trim(), slug: parsed.data.slug.trim() } });
    await logAdminAction({ userId: admin.id, action: 'UPDATE', entity: 'Category', entityId: id, meta: { name: updated.name, slug: updated.slug } });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return { message: 'Duplicate value', errors: { slug: 'Slug already exists' } };
    }
    return { message: 'Server error' };
  }
  revalidatePath('/fa/admin/categories');
  revalidatePath('/en/admin/categories');
  return { ok: true };
}

async function deleteCategory(formData: FormData) {
  'use server';
  const admin = await requireAdmin();
  if (!admin) return;
  if (!isAllowedOrigin()) return;
  const id = String(formData.get('id') || '');
  if (!id) return;
  await prisma.category.delete({ where: { id } });
  await logAdminAction({ userId: admin.id, action: 'DELETE', entity: 'Category', entityId: id });
  revalidatePath('/fa/admin/categories');
  revalidatePath('/en/admin/categories');
}

export default async function CategoriesPage({ params, searchParams }: { params: { locale: string }, searchParams?: Record<string, string | string[] | undefined> }) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect(`/${params.locale}/auth/sign-in?callbackUrl=/${params.locale}/admin/categories`);
  }
  const parseIntSafe = (v: unknown, def: number) => {
    const n = typeof v === 'string' ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  const page = parseIntSafe(searchParams?.page, 1);
  const sizeRaw = parseIntSafe(searchParams?.size, 10);
  const size = Math.min(50, Math.max(1, sizeRaw));
  const dirParam = (typeof searchParams?.dir === 'string' ? searchParams?.dir : 'asc') as string;
  const dir = dirParam === 'asc' || dirParam === 'desc' ? (dirParam as 'asc' | 'desc') : 'asc';
  const [total, categories] = await Promise.all([
    prisma.category.count(),
    prisma.category.findMany({ orderBy: { name: dir }, skip: (page - 1) * size, take: size }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / size));
  const t = (k: string) =>
    (params.locale === 'fa'
      ? ({
          categories: 'دسته‌ها',
          createNew: 'ایجاد جدید',
          existing: 'موجود',
          back: 'بازگشت به داشبورد',
          delete: 'حذف',
        } as any)
      : ({ categories: 'Categories', createNew: 'Create new', existing: 'Existing', back: 'Back to dashboard', delete: 'Delete' } as any))[k];
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{t('categories')}</h1>
        <a className="underline" href={`/${params.locale}/admin`}>
          {t('back')}
        </a>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2">{t('createNew')}</h2>
          <CreateCategoryForm action={createCategoryAction} locale={params.locale as any} />
        </div>
        <div>
          <h2 className="font-medium mb-2">{t('existing')}</h2>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat.id} className="border p-3 rounded">
                <div className="space-y-2">
                  <UpdateCategoryForm action={updateCategoryAction} initial={{ id: cat.id, name: cat.name, slug: cat.slug }} locale={params.locale as any} />
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={cat.id} />
                    <ConfirmSubmit message={params.locale === 'fa' ? 'آیا از حذف مطمئن هستید؟' : 'Are you sure you want to delete?'}>
                      <button type="button" className="px-3 py-1 text-red-600 underline">{t('delete')}</button>
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between mt-4">
            <div>
              <span>
                Page {page} of {totalPages} ({total} total)
              </span>
            </div>
            <div className="space-x-2">
              {page > 1 && (
                <a className="px-3 py-1 border rounded" href={`/${params.locale}/admin/categories?page=${page - 1}&size=${size}&dir=${dir}`}>
                  Prev
                </a>
              )}
              {page < totalPages && (
                <a className="px-3 py-1 border rounded" href={`/${params.locale}/admin/categories?page=${page + 1}&size=${size}&dir=${dir}`}>
                  Next
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
