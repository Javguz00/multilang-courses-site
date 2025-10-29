export const metadata = {
  title: 'بلاگ | فروش دوره‌ها',
  description: 'نکات، راهنماها و بروزرسانی‌ها برای زبان‌آموزان و مدرسین.',
};

import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export default function BlogIndexFa() {
  const posts = getAllPosts("fa");
  return (
    <main className="container py-10 max-w-3xl" dir="rtl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">بلاگ</h1>
        <a className="text-sm text-blue-600 hover:underline" href="/fa/blog/rss">
          RSS
        </a>
      </div>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={`fa-${p.slug}`} className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <Link
                  className="text-lg font-semibold hover:underline"
                  href={`/fa/blog/${p.slug}`}
                >
                  {p.title}
                </Link>
                <p className="text-gray-600 mt-1">{p.excerpt}</p>
              </div>
              <time className="text-sm text-gray-500">
                {new Date(p.date).toLocaleDateString("fa-IR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
