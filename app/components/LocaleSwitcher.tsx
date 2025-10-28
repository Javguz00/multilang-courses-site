'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LocaleSwitcher({ locale }: { locale: 'fa' | 'en' }) {
  const pathname = usePathname();
  const other = locale === 'fa' ? 'en' : 'fa';
  // naive replace leading /fa or /en with other locale
  const nextPath = pathname?.replace(/^\/(fa|en)/, `/${other}`) || `/${other}`;
  return (
    <div className="flex items-center gap-2">
      <Link href={nextPath} className="text-sm text-brand hover:underline">
        {locale === 'fa' ? 'English' : 'فارسی'}
      </Link>
    </div>
  );
}
