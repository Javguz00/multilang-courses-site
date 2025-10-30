import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/blog';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Static, locale-prefixed routes
  const staticPaths = [
    '/en',
    '/fa',
    '/en/courses',
    '/fa/courses',
    '/en/blog',
    '/fa/blog',
    '/en/contact',
    '/fa/contact',
    '/en/about',
    '/fa/about',
    '/en/faq',
    '/fa/faq',
    '/en/terms',
    '/fa/terms',
    '/en/privacy',
    '/fa/privacy',
    '/en/refund-policy',
    '/fa/refund-policy',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Blog posts per locale
  const blogEn = getAllSlugs('en').map<MetadataRoute.Sitemap[number]>((slug) => ({
    url: `${base}/en/blog/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));
  const blogFa = getAllSlugs('fa').map<MetadataRoute.Sitemap[number]>((slug) => ({
    url: `${base}/fa/blog/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // Courses (published) — both locales point to same slug paths
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
  const courseEntries: MetadataRoute.Sitemap = courses.flatMap((c) => [
    {
      url: `${base}/en/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/fa/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]);

  return [...staticEntries, ...blogEn, ...blogFa, ...courseEntries];
}
