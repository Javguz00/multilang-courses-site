export default function CancelPage({ params }: { params: { locale: 'fa' | 'en' } }) {
  const isFa = params.locale === 'fa';
  return (
    <div className="container py-12">
      <h1 className="text-2xl font-semibold mb-4">{isFa ? 'پرداخت لغو شد' : 'Payment canceled'}</h1>
      <p className="text-gray-700">{isFa ? 'شما می‌توانید دوباره تلاش کنید یا سبد خرید خود را بررسی کنید.' : 'You can try again or review your cart.'}</p>
    </div>
  );
}
