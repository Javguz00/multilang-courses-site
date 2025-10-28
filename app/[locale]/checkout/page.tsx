import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readCart, clearCart } from '@/lib/cart';
import { getStripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

export default async function CheckoutPage({ params }: { params: { locale: 'fa' | 'en' } }) {
  const locale = params.locale;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/checkout`);
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/checkout`);

  const items = readCart();
  if (items.length === 0) {
    redirect(`/${locale}/cart`);
  }
  const stripe = getStripe();
  const courses = await prisma.course.findMany({ where: { id: { in: items.map((i) => i.id) }, published: true } });
  if (!courses.length) redirect(`/${locale}/cart`);
  const line_items = courses.map((c) => ({
    quantity: Math.max(1, Math.min(99, items.find((i) => i.id === c.id)?.qty || 1)),
    price_data: {
      currency: (process.env[`CURRENCY_${locale.toUpperCase()}`] as string) || (process.env.DEFAULT_CURRENCY as string) || 'USD',
      product_data: { name: c.title, metadata: { courseId: c.id } },
      unit_amount: Math.round(parseFloat(c.price.toString()) * 100),
    },
  }));
  const successUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/${locale}/checkout/cancel`;
  const sessionStripe = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
      cart: JSON.stringify(items),
      locale,
    },
  });
  redirect(sessionStripe.url!);
}
