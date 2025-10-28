'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function LocaleSwitcher({ locale }: { locale: 'fa' | 'en' }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const other = locale === 'fa' ? 'en' : 'fa';
  // Replace leading /fa or /en with other locale, preserve query and hash
  const basePath = pathname?.replace(/^\/(fa|en)/, `/${other}`) || `/${other}`;
  const query = searchParams?.toString();
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const nextPath = useMemo(() => {
    const q = query ? `?${query}` : '';
    return `${basePath}${q}${hash || ''}`;
  }, [basePath, query, hash]);
  return (
    <div className="flex items-center gap-2">
      <Link href={nextPath} className="text-sm text-brand hover:underline">
        {locale === 'fa' ? 'English' : 'فارسی'}
      </Link>
    </div>
  );
}
