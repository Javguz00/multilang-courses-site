import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';

export default async function OrdersPage({ params }: { params: { locale: 'fa' | 'en' } }) {
  const locale = params.locale;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/profile/orders`);
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/profile/orders`);

  const orders = (await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { course: true } } },
  } as any)) as any[];

  const isFa = locale === 'fa';
  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold mb-6">{isFa ? 'سفارش‌ها' : 'Orders'}</h1>
      {orders.length === 0 ? (
        <div className="text-gray-600">{isFa ? 'سفارشی ندارید.' : 'No orders yet.'}</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{new Date(o.createdAt).toLocaleString()}</div>
                <div className="text-sm uppercase">{o.status}</div>
              </div>
              <div className="text-sm text-gray-700 mt-1">{formatPrice(o.total.toString(), locale)}</div>
              <ul className="mt-3 list-disc pl-5 text-sm">
                {o.items.map((it: any) => (
                  <li key={it.id}>{it.course.title} — {formatPrice(it.price.toString(), locale)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
