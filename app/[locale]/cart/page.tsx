import { prisma } from '@/lib/prisma';
import { readCart } from '@/lib/cart';
import { formatPrice } from '@/lib/currency';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { updateActionForm, removeActionForm } from './actions';

export default async function CartPage({ params }: { params: { locale: 'fa' | 'en' } }) {
  const locale = params.locale;
  const isFa = locale === 'fa';
  const items = readCart();
  const ids = items.map((it) => it.id);
  const courses = ids.length
    ? await prisma.course.findMany({ where: { id: { in: ids }, published: true } })
    : [];
  const merged = items
    .map((it) => {
      const c = courses.find((x) => x.id === it.id);
      if (!c) return null;
      const lineTotal = new Prisma.Decimal(c.price).mul(it.qty);
      return { id: c.id, slug: (c as any).slug, title: c.title, price: c.price, qty: it.qty, lineTotal };
    })
    .filter(Boolean) as Array<{ id: string; slug: string; title: string; price: Prisma.Decimal; qty: number; lineTotal: Prisma.Decimal }>;
  const total = merged.reduce((acc, it) => acc.add(it.lineTotal), new Prisma.Decimal(0));

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-4">{isFa ? 'سبد خرید' : 'Cart'}</h1>
      {merged.length === 0 ? (
        <p className="text-gray-600">{isFa ? 'سبد خرید شما خالی است.' : 'Your cart is empty.'}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul className="divide-y">
              {merged.map((it) => (
                <li key={it.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{it.title}</div>
                    <div className="text-sm text-gray-600">{formatPrice(it.price.toString(), locale)}</div>
                  </div>
                  <form action={updateActionForm} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={it.id} />
                    <label className="text-sm">Qty</label>
                    <input name="qty" type="number" min={1} max={99} defaultValue={it.qty} className="border p-2 w-20" />
                    <button className="px-3 py-2 border rounded" type="submit">{isFa ? 'به‌روزرسانی' : 'Update'}</button>
                    <form action={removeActionForm}>
                      <input type="hidden" name="id" value={it.id} />
                      <button className="px-3 py-2 text-red-600 underline" type="submit">{isFa ? 'حذف' : 'Remove'}</button>
                    </form>
                  </form>
                  <div className="font-medium">{formatPrice(it.lineTotal.toString(), locale)}</div>
                </li>
              ))}
            </ul>
          </div>
          <aside className="lg:col-span-1">
            <div className="border rounded p-4 sticky top-24">
              <div className="text-sm text-gray-600 mb-1">{isFa ? 'جمع کل' : 'Total'}</div>
              <div className="text-2xl font-semibold mb-3">{formatPrice(total.toString(), locale)}</div>
              <form action={async () => { 'use server';
                // handled by checkout action on server in the page below
              }}>
                <a className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded" href={`/${locale}/checkout`}>{isFa ? 'پرداخت' : 'Checkout'}</a>
              </form>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
