import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { zarinpalVerify } from '@/lib/zarinpal';
import { Prisma } from '@prisma/client';
import { sendOrderConfirmation } from '@/lib/email';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const locale = (url.searchParams.get('locale') || 'fa') as 'fa' | 'en';
  const orderId = url.searchParams.get('orderId');
  const status = url.searchParams.get('Status');
  const authority = url.searchParams.get('Authority');

  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  if (!orderId || !authority || status !== 'OK') {
    return Response.redirect(`${base}/${locale}/checkout/cancel`);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });
  if (!order) {
    return Response.redirect(`${base}/${locale}/checkout/cancel`);
  }
  if (order.status === 'PAID') {
    return Response.redirect(`${base}/${locale}/checkout/success`);
  }

  const merchant = process.env.ZARINPAL_MERCHANT_ID as string;
  if (!merchant) {
    return Response.redirect(`${base}/${locale}/checkout/cancel`);
  }

  const amountToman = Math.round(parseFloat(order.total.toString()));
  try {
    const res = await zarinpalVerify({ merchant_id: merchant, amount: amountToman, authority });
    if (!res.ok) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      return Response.redirect(`${base}/${locale}/checkout/cancel`);
    }
    // Mark order paid
    await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } });
    // Create enrollments (idempotent)
    for (const it of order.items) {
      try { await prisma.enrollment.create({ data: { userId: order.userId, courseId: it.courseId } }); } catch {}
    }
    // Best-effort email
    try { if (order.user?.email) await sendOrderConfirmation(order.user.email, order.id); } catch {}
    return Response.redirect(`${base}/${locale}/checkout/success`);
  } catch (e) {
    try { await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }); } catch {}
    return Response.redirect(`${base}/${locale}/checkout/cancel`);
  }
}
