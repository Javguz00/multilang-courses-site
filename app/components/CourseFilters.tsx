"use client";
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type CourseFiltersProps = {
  locale: 'fa' | 'en';
  categories: Array<{ id: string; name: string }>; 
};

export default function CourseFilters({ locale, categories }: CourseFiltersProps) {
  const isFa = locale === 'fa';
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [categoryId, setCategoryId] = useState(sp.get('category') || '');
  const [level, setLevel] = useState(sp.get('level') || '');
  const [language, setLanguage] = useState(sp.get('language') || '');
  const [priceMin, setPriceMin] = useState(sp.get('min') || '');
  const [priceMax, setPriceMax] = useState(sp.get('max') || '');

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      const nsp = new URLSearchParams(Array.from(sp.entries()));
      if (q) nsp.set('q', q); else nsp.delete('q');
      nsp.set('page', '1');
      router.replace(`${pathname}?${nsp.toString()}`);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nsp = new URLSearchParams(Array.from(sp.entries()));
    if (categoryId) nsp.set('category', categoryId); else nsp.delete('category');
    if (level) nsp.set('level', level); else nsp.delete('level');
    if (language) nsp.set('language', language); else nsp.delete('language');
    if (priceMin) nsp.set('min', priceMin); else nsp.delete('min');
    if (priceMax) nsp.set('max', priceMax); else nsp.delete('max');
    nsp.set('page', '1');
    router.replace(`${pathname}?${nsp.toString()}`);
  };

  const t = (k: string) => (isFa ? ({
    search: 'جستجو', category: 'دسته‌بندی', level: 'سطح', language: 'زبان', priceMin: 'حداقل قیمت', priceMax: 'حداکثر قیمت', apply: 'اعمال'
  } as any)[k] : ({
    search: 'Search', category: 'Category', level: 'Level', language: 'Language', priceMin: 'Min price', priceMax: 'Max price', apply: 'Apply'
  } as any)[k]);

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-5 items-end">
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">{t('search')}</label>
        <input value={q} onChange={(e) => setQ(e.target.value)} className="border p-2 w-full" placeholder={t('search')} />
      </div>
      <div>
        <label className="block text-sm mb-1">{t('category')}</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="border p-2 w-full">
          <option value="">--</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">{t('level')}</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="border p-2 w-full">
          <option value="">--</option>
          <option value="BEGINNER">BEGINNER</option>
          <option value="INTERMEDIATE">INTERMEDIATE</option>
          <option value="ADVANCED">ADVANCED</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">{t('language')}</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border p-2 w-full">
          <option value="">--</option>
          <option value="en">English</option>
          <option value="fa">فارسی</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">{t('priceMin')}</label>
        <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="border p-2 w-full" placeholder="0" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">{t('priceMax')}</label>
        <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="border p-2 w-full" placeholder="999" />
      </div>
      <div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{t('apply')}</button>
      </div>
    </form>
  );
}
