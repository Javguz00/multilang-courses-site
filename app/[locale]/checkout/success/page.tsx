import { clearAction } from '@/app/[locale]/cart/actions';

export default function SuccessPage({ params, searchParams }: { params: { locale: 'fa' | 'en' }, searchParams?: Record<string, string | string[] | undefined> }) {
  const isFa = params.locale === 'fa';
  async function clearCartAction() {
    'use server';
    await clearAction();
  }
  return (
    <div className="container py-12">
      <h1 className="text-2xl font-semibold mb-4">{isFa ? 'پرداخت موفق' : 'Payment successful'}</h1>
      <p className="text-gray-700 mb-6">{isFa ? 'از خرید شما سپاسگزاریم. دسترسی به دوره‌ها به زودی فعال می‌شود.' : 'Thank you for your purchase. Your course access will be available shortly.'}</p>
      <form action={clearCartAction}>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">{isFa ? 'بازگشت به دوره‌ها' : 'Back to courses'}</button>
      </form>
    </div>
  );
}
