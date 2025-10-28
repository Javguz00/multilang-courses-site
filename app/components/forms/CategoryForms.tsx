"use client";
import { useFormState, useFormStatus } from 'react-dom';
import type { FieldErrors } from '@/lib/validation';

type CategoryState = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors<{ name: string; slug: string }>;
};

export function CreateCategoryForm({ action, locale }: { action: (state: CategoryState, fd: FormData) => Promise<CategoryState>; locale: 'fa' | 'en' }) {
  const [state, formAction] = useFormState(action, {} as CategoryState);
  const { pending } = useFormStatus();
  const t = (k: string) => (locale === 'fa' ? ({ create: 'ایجاد', name: 'نام', slug: 'نامک (slug)' } as any)[k] : ({ create: 'Create', name: 'Name', slug: 'Slug' } as any)[k]);
  return (
    <form action={formAction} className="space-y-3">
      {state?.message && <p className="text-red-600 text-sm">{state.message}</p>}
      <input name="name" placeholder={t('name')} className="border p-2 w-full" />
      {state?.errors?.name && <p className="text-red-600 text-xs mt-1">{state.errors.name}</p>}
      <input name="slug" placeholder={t('slug')} className="border p-2 w-full" />
      {state?.errors?.slug && <p className="text-red-600 text-xs mt-1">{state.errors.slug}</p>}
      <button disabled={pending} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{t('create')}</button>
    </form>
  );
}

export function UpdateCategoryForm({ action, initial, locale }: { action: (state: CategoryState, fd: FormData) => Promise<CategoryState>; initial: { id: string; name: string; slug: string }; locale: 'fa' | 'en' }) {
  const [state, formAction] = useFormState(action, {} as CategoryState);
  const { pending } = useFormStatus();
  const t = (k: string) => (locale === 'fa' ? ({ save: 'ذخیره', name: 'نام', slug: 'نامک (slug)' } as any)[k] : ({ save: 'Save', name: 'Name', slug: 'Slug' } as any)[k]);
  return (
    <form action={formAction} className="space-y-2">
      {state?.message && <p className="text-red-600 text-sm">{state.message}</p>}
      <input type="hidden" name="id" defaultValue={initial.id} />
      <input name="name" defaultValue={initial.name} className="border p-2 w-full" />
      {state?.errors?.name && <p className="text-red-600 text-xs mt-1">{state.errors.name}</p>}
      <input name="slug" defaultValue={initial.slug} className="border p-2 w-full" />
      {state?.errors?.slug && <p className="text-red-600 text-xs mt-1">{state.errors.slug}</p>}
      <button disabled={pending} type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{t('save')}</button>
    </form>
  );
}
