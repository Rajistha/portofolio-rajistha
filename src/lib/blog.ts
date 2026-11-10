import type { BlogPost } from "@/types/database";

/** Strips tags and estimates reading time at ~200 words per minute. */
export function readingMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 1;
  return Math.max(1, Math.round(text.split(" ").length / 200));
}

export function formatPostDate(iso: string | null, language: "id" | "en"): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC", // same output on server and client, so hydration matches
  });
}

export function localizedPost(post: BlogPost, language: "id" | "en") {
  const en = language === "en";
  return {
    title: (en && post.title_en) || post.title,
    excerpt: (en && post.excerpt_en) || post.excerpt,
    content: (en && post.content_en) || post.content,
  };
}
