"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatPostDate, localizedPost, readingMinutes } from "@/lib/blog";
import type { BlogPost } from "@/types/database";

export function BlogCard({ post }: { post: BlogPost }) {
  const { language, t } = useLanguage();
  const { title, excerpt, content } = localizedPost(post, language);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors duration-300 hover:border-accent/40"
    >
      <div className="relative aspect-16/9 w-full overflow-hidden bg-surface-2">
        {post.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div aria-hidden className="hero-grid flex h-full w-full items-center justify-center">
            <span className="font-display text-4xl text-accent/70">{title.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="mb-2 flex items-start justify-between gap-3 font-display text-xl transition-colors group-hover:text-accent">
          <span>{title}</span>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </h3>

        {excerpt && <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-muted">{excerpt}</p>}

        <p className="mt-auto font-mono text-xs text-muted">
          {formatPostDate(post.published_at, language)} · {readingMinutes(content)} {t.blog.minRead}
        </p>
      </div>
    </Link>
  );
}
