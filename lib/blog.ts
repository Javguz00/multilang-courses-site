export type Locale = "en" | "fa";

export type BlogPost = {
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string;
  date: string; // ISO date string
  content: string; // simple paragraphs separated by \n\n
  tags?: string[];
};

const enPosts: BlogPost[] = [
  {
    slug: "getting-started",
    locale: "en",
    title: "Getting Started with Our Courses",
    excerpt:
      "A quick guide to browsing, purchasing, and accessing your learning content.",
    date: "2025-10-20",
    content:
      [
        "Welcome! This post walks you through how to find the right course, add it to your cart, and complete checkout.",
        "After purchase, you can access content from Profile → Enrollments. Many courses include downloadable resources and a discussion area.",
      ].join("\n\n"),
    tags: ["guide", "onboarding"],
  },
  {
    slug: "study-tips",
    locale: "en",
    title: "5 Study Tips for Busy Learners",
    excerpt:
      "Make the most of short sessions with spaced repetition, goals, and notes.",
    date: "2025-10-24",
    content:
      [
        "Learning effectively doesn’t require marathon sessions. Short, focused blocks add up.",
        "Try setting weekly goals, taking brief notes, and reviewing highlights with spaced repetition.",
      ].join("\n\n"),
    tags: ["productivity"],
  },
];

const faPosts: BlogPost[] = [
  {
    slug: "getting-started",
    locale: "fa",
    title: "شروع کار با دورههای ما",
    excerpt:
      "راهنمای سریع برای جستجو، خرید و دسترسی به محتوای یادگیری.",
    date: "2025-10-20",
    content:
      [
        "خوش آمدید! در این مطلب یاد میگیرید چگونه دوره مناسب را پیدا کنید، به سبد خرید اضافه کنید و پرداخت را کامل نمایید.",
        "پس از خرید، از بخش پروفایل → ثبتنامها به محتوای دوره دسترسی خواهید داشت. بسیاری از دورهها منابع قابل دانلود و بخش گفتگو دارند.",
      ].join("\n\n"),
    tags: ["راهنما", "شروع"],
  },
  {
    slug: "study-tips",
    locale: "fa",
    title: "۵ نکته مطالعه برای افراد پرمشغله",
    excerpt:
      "از جلسات کوتاه با تکرار با فاصله، هدفگذاری و یادداشتبرداری بیشترین بهره را ببرید.",
    date: "2025-10-24",
    content:
      [
        "یادگیری موثر نیاز به جلسات طولانی ندارد؛ بلوکهای کوتاه و متمرکز بسیار کارآمد هستند.",
        "اهداف هفتگی تعیین کنید، یادداشتهای کوتاه بردارید و نکات کلیدی را با تکرار با فاصله مرور کنید.",
      ].join("\n\n"),
    tags: ["بهرهوری"],
  },
];

export function getAllPosts(locale: Locale): BlogPost[] {
  const list = locale === "fa" ? faPosts : enPosts;
  return list.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(locale: Locale, slug: string): BlogPost | null {
  const list = locale === "fa" ? faPosts : enPosts;
  return list.find((p) => p.slug === slug) ?? null;
}

export function getAllSlugs(locale: Locale): string[] {
  return getAllPosts(locale).map((p) => p.slug);
}
