"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { CopyLinkButton } from "@/components/site/copy-link-button";
import { ProjectBody } from "@/components/site/project-body";
import { ProjectPlaceholder } from "@/components/site/project-placeholder";
import { useLanguage } from "@/components/language-provider";
import { resolveProjectImage } from "@/lib/project-image";
import type { Project } from "@/types/database";

export function ProjectPage({
  project,
  previous,
  next,
}: {
  project: Project;
  previous: Project | null;
  next: Project | null;
}) {
  const { t } = useLanguage();
  const image = resolveProjectImage(project);
  const inProgress = project.status === "in_progress";

  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
      <Link
        href="/#work"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.project.back}
      </Link>

      <Reveal>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            {"// " + t.project.caseStudy.toUpperCase()}
          </span>
          {inProgress && (
            <span className="rounded-md border border-amber-500/40 px-2 py-0.5 text-[11px] font-medium text-amber-400">
              {t.work.inProgress}
            </span>
          )}
          {project.featured && (
            <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium text-background">
              {t.work.featured}
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl leading-tight sm:text-5xl">{project.title}</h1>
        <div className="mt-6 flex justify-end border-t border-border pt-3">
          <CopyLinkButton label={t.project.copyLink} copiedLabel={t.project.copied} />
        </div>
      </Reveal>

      <div className="mt-6 aspect-16/10 w-full overflow-hidden rounded-xl border border-border bg-surface-2">
        {image.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={project.title}
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <ProjectPlaceholder project={project} />
        )}
      </div>

      <div className="mt-8 space-y-5 sm:space-y-6">
        <ProjectBody project={project} />
      </div>

      {(previous || next) && (
        <nav
          aria-label="Project navigation"
          className="mt-14 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={`/projects/${previous.slug}`}
              className="group rounded-xl border border-border p-4 transition-colors hover:border-accent/40"
            >
              <p className="mb-1 flex items-center gap-1.5 text-xs text-muted">
                <ArrowLeft className="h-3.5 w-3.5" />
                {t.project.previous}
              </p>
              <p className="font-display transition-colors group-hover:text-accent">{previous.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/projects/${next.slug}`}
              className="group rounded-xl border border-border p-4 text-right transition-colors hover:border-accent/40"
            >
              <p className="mb-1 flex items-center justify-end gap-1.5 text-xs text-muted">
                {t.project.next}
                <ArrowRight className="h-3.5 w-3.5" />
              </p>
              <p className="font-display transition-colors group-hover:text-accent">{next.title}</p>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
