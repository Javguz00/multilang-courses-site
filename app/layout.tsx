import './globals.css';
import type { Metadata } from 'next';
import { clsx } from 'clsx';
import { cookies } from 'next/headers';
import Analytics from './components/Analytics';

export const metadata: Metadata = {
  title: 'فروش دوره‌های برنامه‌نویسی | Programming Courses',
  description: 'سایت چندزبانه ساده برای فروش دوره‌های برنامه‌نویسی',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'Programming Courses',
    title: 'فروش دوره‌های برنامه‌نویسی | Programming Courses',
    description: 'سایت چندزبانه ساده برای فروش دوره‌های برنامه‌نویسی',
  },
  twitter: {
    card: 'summary',
    title: 'Programming Courses',
    description: 'A multilingual site to sell programming courses.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read locale from cookie set by middleware; fallback to 'fa'
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  const locale = cookieLocale === 'en' ? 'en' : 'fa';
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={clsx('min-h-screen')}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
