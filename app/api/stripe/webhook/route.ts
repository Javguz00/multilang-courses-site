import { NextRequest } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { sendOrderConfirmation } from '@/lib/email';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new Response('Missing signature', { status: 400 });
  const buf = Buffer.from(await req.arrayBuffer());
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, secret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId: string | undefined = session.metadata?.userId;
      const cartRaw: string | undefined = session.metadata?.cart;
      if (!userId || !cartRaw) break;
      let items: Array<{ id: string; qty: number }> = [];
      try { items = JSON.parse(cartRaw); } catch {}
      if (!Array.isArray(items) || items.length === 0) break;
      const courses = await prisma.course.findMany({ where: { id: { in: items.map((i) => i.id) } } });
      if (!courses.length) break;
      const orderItems = items
        .map((it) => {
          const c = courses.find((x) => x.id === it.id);
          if (!c) return null;
          const price = new Prisma.Decimal(c.price);
          return { courseId: c.id, price, quantity: Math.max(1, Math.min(99, it.qty)) };
        })
        .filter(Boolean) as Array<{ courseId: string; price: Prisma.Decimal; quantity: number }>;
      const total = orderItems.reduce((acc, oi) => acc.add(oi.price.mul(oi.quantity)), new Prisma.Decimal(0));
      const order = await prisma.order.create({
        data: {
          userId,
          total,
          status: 'PAID',
          items: { create: orderItems },
        },
      });
      // Create enrollments (idempotent thanks to unique index on userId+courseId)
      for (const oi of orderItems) {
        try { await prisma.enrollment.create({ data: { userId, courseId: oi.courseId } }); } catch {}
      }
      // Send order confirmation email (best-effort)
      try {
        const to: string | undefined = session.customer_details?.email || session.customer_email || undefined;
        if (to) {
          await sendOrderConfirmation(to, order.id);
        }
      } catch {}
      break;
    }
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired':
    case 'checkout.session.completed':
    default:
      break;
  }
  return new Response('ok');
}
