"use client";

import { FileText } from "lucide-react";
import { Reveal, RevealStagger, RevealStaggerItem } from "@/components/ui/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { BlogCard } from "@/components/site/blog-card";
import { useLanguage } from "@/components/language-provider";
import type { BlogPost } from "@/types/database";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
      <Reveal>
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          {"// " + t.blog.eyebrow.toUpperCase()}
        </p>
        <h1 className="font-display text-3xl sm:text-5xl">{t.blog.title}</h1>
        <p className="mt-4 max-w-xl text-muted">{t.blog.lead}</p>
      </Reveal>

      <div className="mt-12 sm:mt-14">
        {posts.length === 0 ? (
          <EmptyState icon={FileText} title={t.blog.empty} />
        ) : (
          <RevealStagger className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <RevealStaggerItem key={post.id} className="h-full">
                <BlogCard post={post} />
              </RevealStaggerItem>
            ))}
          </RevealStagger>
        )}
      </div>
    </section>
  );
}
