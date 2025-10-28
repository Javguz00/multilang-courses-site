"use client";
import { useFormState, useFormStatus } from 'react-dom';
import type { FieldErrors } from '@/lib/validation';

export type CourseFormState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors<{
    title: string;
    price: string;
    description?: string;
    syllabus?: string;
    mediaUrl?: string;
    categoryId: string;
    slug: string;
  }>;
};

export default function CourseForm({
  action,
  initial,
  categories,
  locale,
}: {
  action: (state: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  initial?: any;
  categories: Array<{ id: string; name: string }>;
  locale: 'fa' | 'en';
}) {
  const [state, formAction] = useFormState(action, {} as CourseFormState);
  const { pending } = useFormStatus();
  const t = (k: string) =>
    locale === 'fa'
      ? (
          {
            title: 'عنوان',
            price: 'قیمت',
            description: 'توضیح کوتاه',
            syllabus: 'سرفصل',
            mediaUrl: 'آدرس رسانه',
            category: 'دسته‌بندی',
            slug: 'نامک (slug)',
            published: 'منتشر شده',
            create: 'ایجاد',
            save: 'ذخیره',
            cancel: 'انصراف',
          } as any
        )[k]
      : (
          {
            title: 'Title',
            price: 'Price',
            description: 'Short description',
            syllabus: 'Syllabus',
            mediaUrl: 'Media URL',
            category: 'Category',
            slug: 'Slug',
            published: 'Published',
            create: 'Create',
            save: 'Save',
            cancel: 'Cancel',
          } as any
        )[k];

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && <p className="text-red-600 text-sm">{state.message}</p>}
      {initial?.id ? <input type="hidden" name="id" defaultValue={initial.id} /> : null}
      <div>
        <label className="block mb-1">{t('title')}</label>
        <input name="title" defaultValue={initial?.title || ''} className="border p-2 w-full" required />
        {state?.errors?.title && <p className="text-red-600 text-xs mt-1">{state.errors.title}</p>}
      </div>
      <div>
        <label className="block mb-1">{t('slug')}</label>
        <input name="slug" defaultValue={initial?.slug || ''} className="border p-2 w-full" required />
        {state?.errors?.slug && <p className="text-red-600 text-xs mt-1">{state.errors.slug}</p>}
      </div>
      <div>
        <label className="block mb-1">{t('price')} (e.g., 49.00)</label>
        <input name="price" defaultValue={initial?.price?.toString?.() || ''} className="border p-2 w-full" required />
        {state?.errors?.price && <p className="text-red-600 text-xs mt-1">{state.errors.price}</p>}
      </div>
      <div>
        <label className="block mb-1">{t('description')}</label>
        <textarea name="description" defaultValue={initial?.description || ''} className="border p-2 w-full" rows={2} />
        {state?.errors?.description && <p className="text-red-600 text-xs mt-1">{state.errors.description}</p>}
      </div>
      <div>
        <label className="block mb-1">{t('syllabus')}</label>
        <textarea name="syllabus" defaultValue={initial?.syllabus || ''} className="border p-2 w-full" rows={6} />
        {state?.errors?.syllabus && <p className="text-red-600 text-xs mt-1">{state.errors.syllabus}</p>}
      </div>
      <div>
        <label className="block mb-1">{t('mediaUrl')}</label>
        <input name="mediaUrl" defaultValue={initial?.mediaUrl || ''} className="border p-2 w-full" />
        {state?.errors?.mediaUrl && <p className="text-red-600 text-xs mt-1">{state.errors.mediaUrl}</p>}
      </div>
      <div>
        <label className="block mb-1">{t('category')}</label>
        <select name="categoryId" defaultValue={initial?.categoryId || ''} className="border p-2 w-full" required>
          <option value="">--</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {state?.errors?.categoryId && <p className="text-red-600 text-xs mt-1">{state.errors.categoryId}</p>}
      </div>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked={!!initial?.published} /> <span>{t('published')}</span>
      </label>
      <div className="flex gap-2">
        <button disabled={pending} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          {initial ? t('save') : t('create')}
        </button>
        <button type="reset" className="px-4 py-2 border rounded">
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
