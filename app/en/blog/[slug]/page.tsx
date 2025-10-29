import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllSlugs("en").map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug("en", params.slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default function BlogPostEn({ params }: Props) {
  const post = getPostBySlug("en", params.slug);
  if (!post) return notFound();
  const paragraphs = post.content.split(/\n\n+/);
  return (
    <main className="container py-10 max-w-3xl">
      <article>
        <header className="mb-6">
          <h1 className="text-3xl font-semibold mb-2">{post.title}</h1>
          <time className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </header>
        <div className="prose max-w-none">
          {paragraphs.map((para, i) => (
            <p key={i} className="mb-4 text-gray-800">
              {para}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
