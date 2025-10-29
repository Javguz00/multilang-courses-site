export const metadata = {
  title: 'سیاست حریم خصوصی | فروش دوره‌ها',
  description: 'نحوه استفاده از کوکی‌ها و مدیریت داده‌های شخصی شما.',
};

export default function PrivacyFa() {
  return (
    <main className="container py-10 max-w-3xl" dir="rtl">
      <h1 className="text-3xl font-semibold mb-6">سیاست حریم خصوصی</h1>
      <p className="text-gray-700 mb-4">
        ما حداقل دادههای لازم برای اجرای پلتفرم را جمعآوری میکنیم مانند نام،
        ایمیل و تاریخچه خرید. اطلاعات شخصی شما فروخته نمیشود.
      </p>
      <p className="text-gray-700 mb-4">
        از کوکیها برای نگهداری نشست کاربر و سبد خرید استفاده میشود. میتوانید
        از طریق تنظیمات مرورگر کوکیها را مدیریت کنید.
      </p>
      <p className="text-gray-700">در صورت وجود هرگونه سوال مرتبط با حریم خصوصی با ما در تماس باشید.</p>
    </main>
  );
}
