import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage({ params }: { params: { locale: 'fa' | 'en' } }) {
  const locale = params.locale;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/profile`);
  }
  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold mb-4">{locale === 'fa' ? 'پروفایل' : 'Profile'}</h1>
      <p>{locale === 'fa' ? 'ایمیل:' : 'Email:'} {session.user?.email}</p>
    </main>
  );
}
