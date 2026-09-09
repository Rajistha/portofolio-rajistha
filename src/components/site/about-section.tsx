"use client";

import DOMPurify from "isomorphic-dompurify";
import { Reveal } from "@/components/ui/reveal";
import { useLanguage } from "@/components/language-provider";
import type { Profile } from "@/types/database";

export function AboutSection({ profile }: { profile: Profile | null }) {
  const { t, language } = useLanguage();
  const bio =
    language === "en"
      ? profile?.bio_en || profile?.bio
      : profile?.bio || profile?.bio_en;
  const bioHtml = DOMPurify.sanitize(bio || `<p>${t.about.defaultBio}</p>`);

  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h2 className="mb-6 font-display text-3xl sm:text-4xl">{t.about.title}</h2>
      </Reveal>
      <Reveal delay={0.05}>
        <div
          className="prose-content max-w-2xl text-lg leading-relaxed text-muted"
          dangerouslySetInnerHTML={{ __html: bioHtml }}
        />
      </Reveal>
    </section>
  );
}
