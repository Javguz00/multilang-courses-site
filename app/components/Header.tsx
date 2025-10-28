import Link from 'next/link';
import LocaleSwitcher from './LocaleSwitcher';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SignOutButton from './SignOutButton';

export default async function Header({ locale }: { locale: 'fa' | 'en' }) {
  const isFa = locale === 'fa';
  const session = await getServerSession(authOptions);
  return (
    <header className="border-b">
      <div className="container py-4 flex items-center justify-between">
        <div className="font-semibold">{isFa ? 'فروش دوره‌ها' : 'Programming Courses'}</div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href={`/${locale}`}>{isFa ? 'خانه' : 'Home'}</Link>
          <Link href={`/${locale}/courses`}>{isFa ? 'دوره‌ها' : 'Courses'}</Link>
          <Link href={`/${locale}/contact`}>{isFa ? 'Contact' : 'Contact'}</Link>
          <LocaleSwitcher locale={locale} />
          {session?.user?.email ? (
            <>
              <Link href={`/${locale}/profile`} className="text-gray-700">{session.user.email}</Link>
              <SignOutButton label={isFa ? 'خروج' : 'Sign out'} />
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/sign-in`}>{isFa ? 'ورود' : 'Sign in'}</Link>
              <Link href={`/${locale}/auth/sign-up`}>{isFa ? 'ثبت‌نام' : 'Sign up'}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
