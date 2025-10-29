import Link from 'next/link';

export default function Footer({ locale }: { locale: 'fa' | 'en' }) {
  const isFa = locale === 'fa';
  const base = `/${locale}`;
  const links = [
    { href: `${base}/about`, label: isFa ? 'درباره' : 'About' },
    { href: `${base}/blog`, label: isFa ? 'بلاگ' : 'Blog' },
    { href: `${base}/faq`, label: isFa ? 'پرسش‌های متداول' : 'FAQ' },
    { href: `${base}/terms`, label: isFa ? 'شرایط استفاده' : 'Terms' },
    { href: `${base}/privacy`, label: isFa ? 'حریم خصوصی' : 'Privacy' },
    { href: `${base}/refund-policy`, label: isFa ? 'بازپرداخت' : 'Refunds' },
    { href: `${base}/contact`, label: isFa ? 'تماس' : 'Contact' },
  ];
  return (
    <footer className="border-t mt-8">
      <div className="container py-6 text-sm text-gray-600 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <span>{isFa ? '© تمامی حقوق محفوظ است' : '© All rights reserved'}</span>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {links.map((l) => (
            <Link key={l.href} className="hover:underline" href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
