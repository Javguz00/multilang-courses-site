import Link from "next/link";

export default function NotFoundFa() {
  return (
    <main className="container py-16 max-w-2xl text-center" dir="rtl">
      <h1 className="text-3xl font-semibold mb-2">صفحه پیدا نشد</h1>
      <p className="text-gray-600 mb-6">صفحه مورد نظر شما وجود ندارد.</p>
      <Link href="/fa" className="text-blue-600 hover:underline">
        بازگشت به صفحه اصلی
      </Link>
    </main>
  );
}
