import './globals.css';
import type { Metadata } from 'next';
import { clsx } from 'clsx';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'فروش دوره‌های برنامه‌نویسی | Programming Courses',
  description: 'سایت چندزبانه ساده برای فروش دوره‌های برنامه‌نویسی'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read locale from cookie set by middleware; fallback to 'fa'
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  const locale = cookieLocale === 'en' ? 'en' : 'fa';
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={clsx('min-h-screen')}>{children}</body>
    </html>
  );
}
