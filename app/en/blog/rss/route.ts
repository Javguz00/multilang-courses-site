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
  const posts = getAllPosts("en");
  const siteTitle = "Programming Courses Blog";
  const siteLink = `${origin}/en/blog`;
  const siteDesc = "Tips, guides, and updates for learners and instructors.";

  const items = posts
    .map((p) => {
      const link = `${origin}/en/blog/${p.slug}`;
      const pubDate = new Date(p.date).toUTCString();
      const description = escape(p.excerpt);
      const title = escape(p.title);
      return `\n    <item>\n      <title>${title}</title>\n      <link>${link}</link>\n      <guid>${link}</guid>\n      <pubDate>${pubDate}</pubDate>\n      <description>${description}</description>\n    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(siteTitle)}</title>
    <link>${siteLink}</link>
    <description>${escape(siteDesc)}</description>
    <language>en-US</language>${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
    },
  });
}
