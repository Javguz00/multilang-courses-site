export const metadata = {
  title: 'پرسش‌های متداول | فروش دوره‌ها',
  description: 'پرسش و پاسخ درباره دسترسی به دوره‌ها، بازپرداخت و ثبت نظر.',
};

export default function FaqFa() {
  const faqs = [
    {
      q: "چگونه به دورههای خریداریشده دسترسی پیدا کنم؟",
      a: "به پروفایل → ثبتنامها بروید و روی «رفتن به محتوا» کلیک کنید. پس از پرداخت ایمیل تایید هم دریافت میکنید.",
    },
    {
      q: "آیا امکان بازپرداخت وجود دارد؟",
      a: "بله، تا ۱۴ روز برای بیشتر دورهها در صورتی که کمتر از ۲۰٪ مصرف شده باشد. جزئیات در سیاست بازپرداخت آمده است.",
    },
    {
      q: "میتوانم نظر بدهم؟",
      a: "حتما. پس از ثبتنام، در صفحه دوره میتوانید امتیاز و بازخورد خود را ثبت کنید.",
    },
  ];

  return (
    <main className="container py-10 max-w-3xl" dir="rtl">
      <h1 className="text-3xl font-semibold mb-6">پرسشهای متداول</h1>
      <div className="space-y-6">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">{f.q}</h3>
            <p className="text-gray-700">{f.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
