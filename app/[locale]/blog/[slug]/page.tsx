import { notFound } from "next/navigation";

export const dynamicParams = false;

export default function BlogPostRemoved() {
  // This route is intentionally disabled in favor of /en/blog/[slug] and /fa/blog/[slug]
  notFound();
}
