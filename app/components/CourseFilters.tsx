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
  const [sort, setSort] = useState(sp.get('sort') || 'createdAt');
  const [dir, setDir] = useState(sp.get('dir') || 'desc');

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      const nsp = new URLSearchParams(Array.from(sp.entries()));
      if (q) nsp.set('q', q); else nsp.delete('q');
      nsp.set('page', '1');
      router.replace(`${pathname}?${nsp.toString()}`);
      setTimeout(() => {
        const el = document.getElementById('results-heading');
        el?.focus?.();
      }, 0);
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
    if (sort) nsp.set('sort', sort); else nsp.delete('sort');
    if (dir) nsp.set('dir', dir); else nsp.delete('dir');
    nsp.set('page', '1');
    router.replace(`${pathname}?${nsp.toString()}`);
    setTimeout(() => {
      const el = document.getElementById('results-heading');
      el?.focus?.();
    }, 0);
  };

  const t = (k: string) => (isFa ? ({
    search: 'جستجو', category: 'دسته‌بندی', level: 'سطح', language: 'زبان', priceMin: 'حداقل قیمت', priceMax: 'حداکثر قیمت', apply: 'اعمال', sort: 'مرتب‌سازی', direction: 'جهت'
  } as any)[k] : ({
    search: 'Search', category: 'Category', level: 'Level', language: 'Language', priceMin: 'Min price', priceMax: 'Max price', apply: 'Apply', sort: 'Sort by', direction: 'Direction'
  } as any)[k]);

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-6 items-end" aria-label="Course filters">
      <div className="md:col-span-2">
        <label className="block text-sm mb-1" htmlFor="filter-search">{t('search')}</label>
        <input id="filter-search" aria-label={t('search')} value={q} onChange={(e) => setQ(e.target.value)} className="border p-2 w-full" placeholder={t('search')} />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="filter-category">{t('category')}</label>
        <select id="filter-category" aria-label={t('category')} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="border p-2 w-full">
          <option value="">--</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="filter-level">{t('level')}</label>
        <select id="filter-level" aria-label={t('level')} value={level} onChange={(e) => setLevel(e.target.value)} className="border p-2 w-full">
          <option value="">--</option>
          <option value="BEGINNER">BEGINNER</option>
          <option value="INTERMEDIATE">INTERMEDIATE</option>
          <option value="ADVANCED">ADVANCED</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="filter-language">{t('language')}</label>
        <select id="filter-language" aria-label={t('language')} value={language} onChange={(e) => setLanguage(e.target.value)} className="border p-2 w-full">
          <option value="">--</option>
          <option value="en">English</option>
          <option value="fa">فارسی</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="filter-sort">{t('sort')}</label>
        <select id="filter-sort" aria-label={t('sort')} value={sort} onChange={(e) => setSort(e.target.value)} className="border p-2 w-full">
          <option value="createdAt">Newest</option>
          <option value="title">Title</option>
          <option value="price">Price</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="filter-dir">{t('direction')}</label>
        <select id="filter-dir" aria-label={t('direction')} value={dir} onChange={(e) => setDir(e.target.value)} className="border p-2 w-full">
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm mb-1" htmlFor="filter-min">{t('priceMin')}</label>
        <input id="filter-min" aria-label={t('priceMin')} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="border p-2 w-full" placeholder="0" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm mb-1" htmlFor="filter-max">{t('priceMax')}</label>
        <input id="filter-max" aria-label={t('priceMax')} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="border p-2 w-full" placeholder="999" />
      </div>
      <div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{t('apply')}</button>
      </div>
    </form>
  );
}
