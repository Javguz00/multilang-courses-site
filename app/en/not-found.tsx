import Link from "next/link";

export default function NotFoundEn() {
  return (
    <main className="container py-16 max-w-2xl text-center">
      <h1 className="text-3xl font-semibold mb-2">Page not found</h1>
      <p className="text-gray-600 mb-6">The page you’re looking for doesn’t exist.</p>
      <Link href="/en" className="text-blue-600 hover:underline">
        Go back home
      </Link>
    </main>
  );
}
