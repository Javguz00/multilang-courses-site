import { getAllPosts } from "@/lib/blog";
import type { NextRequest } from "next/server";

function escape(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const posts = getAllPosts("fa");
  const siteTitle = "بلاگ فروش دوره‌ها";
  const siteLink = `${origin}/fa/blog`;
  const siteDesc = "نکات، راهنماها و بروزرسانی‌ها برای زبان‌آموزان و مدرسین.";
  const lastBuildDate = new Date().toUTCString();

  const items = posts
    .map((p) => {
      const link = `${origin}/fa/blog/${p.slug}`;
      const pubDate = new Date(p.date).toUTCString();
      const description = escape(p.excerpt);
      const title = escape(p.title);
      return `\n    <item>\n      <title>${title}</title>\n      <link>${link}</link>\n      <guid>${link}</guid>\n      <pubDate>${pubDate}</pubDate>\n      <description>${description}</description>\n    </item>`;
    })
    .join("");

  const selfHref = `${origin}/fa/blog/rss`;
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteTitle)}</title>
    <link>${siteLink}</link>
    <description>${escape(siteDesc)}</description>
    <atom:link href="${selfHref}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <language>fa-IR</language>${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
    },
  });
}
