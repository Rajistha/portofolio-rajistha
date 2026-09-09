"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { RevealStaggerItem } from "@/components/ui/reveal";
import { TechIcon } from "@/components/ui/tech-icon";
import { useLanguage } from "@/components/language-provider";
import type { Project } from "@/types/database";

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useLanguage();

  return (
    <RevealStaggerItem>
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="group relative overflow-hidden rounded-lg border border-border bg-surface"
      >
        <div className="relative aspect-16/10 w-full overflow-hidden bg-surface-2">
          {project.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image_url}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-2xl text-muted">
              {project.title}
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />

          {project.featured && (
            <span className="absolute left-4 top-4 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-background">
              {t.work.featured}
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h3 className="font-display text-xl">{project.title}</h3>
            <div className="flex shrink-0 gap-2">
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t.work.viewSourceCode}
                  className="group/tip relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <TechIcon slug="github" name="GitHub" size={16} className="icon-mono" />
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100">
                    {t.work.sourceCode}
                  </span>
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t.work.viewLiveSite}
                  className="group/tip relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100">
                    {t.work.liveDemo}
                  </span>
                </a>
              )}
            </div>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-muted">{project.summary}</p>

          {project.tech_stacks && project.tech_stacks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              {project.tech_stacks.map((tech) => (
                <div
                  key={tech.id}
                  title={tech.name}
                  className="flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1"
                >
                  <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={14} />
                  <span className="text-xs text-foreground/80">{tech.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.article>
    </RevealStaggerItem>
  );
}
