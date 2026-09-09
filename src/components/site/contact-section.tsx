"use client";

import { Mail } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { useLanguage } from "@/components/language-provider";
import type { Profile } from "@/types/database";

export function ContactSection({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage();

  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h2 className="max-w-xl font-display text-3xl sm:text-4xl">{t.contact.title}</h2>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
            >
              <Mail className="h-4 w-4" />
              {profile.email}
            </a>
          )}
          <div className="flex gap-2">
            {profile?.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="group/tip relative flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                <GithubIcon size={16} />
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100">
                  GitHub
                </span>
              </a>
            )}
            {profile?.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="group/tip relative flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                <LinkedinIcon size={16} />
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100">
                  LinkedIn
                </span>
              </a>
            )}
            {profile?.instagram_url && (
              <a
                href={profile.instagram_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="group/tip relative flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                <InstagramIcon size={16} />
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100">
                  Instagram
                </span>
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
