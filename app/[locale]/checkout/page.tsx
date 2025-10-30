import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readCart } from '@/lib/cart';
import { getStripe } from '@/lib/stripe';
import { zarinpalRequest, getZarinpalStartUrl } from '@/lib/zarinpal';
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { rateLimit } from '@/lib/rateLimit';

export default async function CheckoutPage({ params }: { params: { locale: 'fa' | 'en' } }) {
  const locale = params.locale;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/checkout`);
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/checkout`);

  const limiterOk = rateLimit((session.user as any)?.id || 'anon', 5, 60_000); // 5 sessions/min/user
  if (!limiterOk) {
    redirect(`/${locale}/cart?err=rate_limited`);
  }

  const items = readCart();
  if (items.length === 0) {
    redirect(`/${locale}/cart`);
  }
  const provider = (process.env.PAYMENT_PROVIDER || 'stripe').toLowerCase();
  // Exclude courses the user is already enrolled in to avoid duplicate purchases
  const coursesAll = await prisma.course.findMany({ where: { id: { in: items.map((i) => i.id) }, published: true } });
  const enrollments = await prisma.enrollment.findMany({ where: { userId: user.id, courseId: { in: coursesAll.map(c => c.id) } } });
  const enrolledIds = new Set(enrollments.map(e => e.courseId));
  const courses = coursesAll.filter(c => !enrolledIds.has(c.id));
  if (!courses.length) redirect(`/${locale}/cart`);
  const line_items = courses.map((c) => ({
    quantity: 1,
    price_data: {
      currency: (process.env[`CURRENCY_${locale.toUpperCase()}`] as string) || (process.env.DEFAULT_CURRENCY as string) || 'USD',
      product_data: { name: c.title, metadata: { courseId: c.id } },
      unit_amount: Math.round(parseFloat(c.price.toString()) * 100),
    },
  }));
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  if (provider === 'zarinpal' || locale === 'fa') {
    // Create a pending order first, then request Zarinpal payment and redirect
    const coursesAll = await prisma.course.findMany({ where: { id: { in: items.map((i) => i.id) }, published: true } });
    const enrolled = await prisma.enrollment.findMany({ where: { userId: user.id, courseId: { in: coursesAll.map((c) => c.id) } } });
    const enrolledIds = new Set(enrolled.map((e) => e.courseId));
    const selected = coursesAll.filter((c) => !enrolledIds.has(c.id));
  const orderItems = selected.map((c) => ({ courseId: c.id, price: c.price, quantity: 1 }));
  const total = orderItems.reduce((acc, oi) => acc.add(oi.price.mul(oi.quantity)), new Prisma.Decimal(0));
    const pending = await prisma.order.create({ data: { userId: user.id, total, status: 'PENDING', items: { create: orderItems } } });
    const merchant = process.env.ZARINPAL_MERCHANT_ID as string;
    if (!merchant) redirect(`/${locale}/checkout/cancel?err=zarinpal_config`);
    const amountToman = Math.round(parseFloat(total.toString()));
    const callback_url = `${baseUrl}/api/payments/zarinpal/callback?orderId=${encodeURIComponent(pending.id)}&locale=${locale}`;
    try {
      const { authority } = await zarinpalRequest({
        merchant_id: merchant,
        amount: amountToman,
        description: `Order ${pending.id}`,
        callback_url,
        email: user.email,
      });
      const redirectUrl = getZarinpalStartUrl(authority);
      redirect(redirectUrl);
    } catch (e) {
      // On failure, mark order cancelled and return to cart
      try { await prisma.order.update({ where: { id: pending.id }, data: { status: 'CANCELLED' } }); } catch {}
      redirect(`/${locale}/cart?err=payment_unavailable`);
    }
  } else {
    const stripe = getStripe();
    const successUrl = `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/${locale}/checkout/cancel`;
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
}
