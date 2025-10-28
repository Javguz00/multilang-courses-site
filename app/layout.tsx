import './globals.css';
import type { Metadata } from 'next';
import { clsx } from 'clsx';

export const metadata: Metadata = {
  title: 'فروش دوره‌های برنامه‌نویسی | Programming Courses',
  description: 'سایت چندزبانه ساده برای فروش دوره‌های برنامه‌نویسی'
};

export default function RootLayout({ children, params }: { children: React.ReactNode; params?: any }) {
  // i18n will be handled later; default to fa
  const lang = 'fa';
  return (
    <html lang={lang}>
      <body className={clsx('min-h-screen')}>{children}</body>
    </html>
  );
}
