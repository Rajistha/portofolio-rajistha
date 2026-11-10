"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { Reveal } from "@/components/ui/reveal";
import { BlogCard } from "@/components/site/blog-card";
import { CopyLinkButton } from "@/components/site/copy-link-button";
import { useLanguage } from "@/components/language-provider";
import { formatPostDate, localizedPost, readingMinutes } from "@/lib/blog";
import type { BlogPost } from "@/types/database";

export function BlogArticle({ post, related }: { post: BlogPost; related: BlogPost[] }) {
  const { language, t } = useLanguage();
  const { title, excerpt, content } = localizedPost(post, language);
  const html = DOMPurify.sanitize(content);

  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.blog.back}
      </Link>

      <Reveal>
        {post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="font-display text-3xl leading-tight sm:text-5xl">{title}</h1>
        {excerpt && <p className="mt-4 text-lg leading-relaxed text-muted">{excerpt}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
          <p className="font-mono text-xs text-muted">
            {formatPostDate(post.published_at, language)} · {readingMinutes(content)} {t.blog.minRead}
          </p>
          <CopyLinkButton label={t.blog.share} copiedLabel={t.blog.copied} />
        </div>
      </Reveal>

      {post.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_url}
          alt=""
          decoding="async"
          className="mt-8 aspect-video w-full rounded-xl border border-border object-cover"
        />
      )}

      <div
        className="prose-content prose-article mt-8 text-base leading-relaxed text-foreground/85"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10" aria-labelledby="related-posts">
          <h2 id="related-posts" className="mb-6 font-display text-xl">
            {t.blog.related}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <BlogCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
