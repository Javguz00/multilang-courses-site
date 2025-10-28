import Link from 'next/link';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header({ locale }: { locale: 'fa' | 'en' }) {
  const isFa = locale === 'fa';
  return (
    <header className="border-b">
      <div className="container py-4 flex items-center justify-between">
        <div className="font-semibold">{isFa ? 'فروش دوره‌ها' : 'Programming Courses'}</div>
        <nav className="flex gap-4 text-sm">
          <Link href={`/${locale}`}>{isFa ? 'خانه' : 'Home'}</Link>
          <Link href={`/${locale}/courses`}>{isFa ? 'دوره‌ها' : 'Courses'}</Link>
          <Link href={`/${locale}/contact`}>{isFa ? 'Contact' : 'Contact'}</Link>
        </nav>
        <LocaleSwitcher locale={locale} />
      </div>
    </header>
  );
}
