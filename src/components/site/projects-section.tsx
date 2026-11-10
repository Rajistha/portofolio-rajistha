"use client";

import { useState } from "react";
import { Reveal, RevealStagger } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/site/project-card";
import { useLanguage } from "@/components/language-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";
import type { Project } from "@/types/database";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const { t, language } = useLanguage();
  const isId = language === "id";
  const [filter, setFilter] = useState<"all" | "completed" | "in_progress">("all");

  const hasInProgress = projects.some((p) => p.status === "in_progress");

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "in_progress") return project.status === "in_progress";
    return !project.status || project.status === "completed";
  });

  return (
    <section id="work" className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent font-semibold">{"// 04. SELECTED WORK"}</p>
          <h2 className="font-display text-3xl sm:text-4xl">{t.work.title}</h2>
        </Reveal>

        {hasInProgress && (
          <Reveal>
            {/* Horizontal scrollable wrapper for mobile without scrollbar */}
            <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="inline-flex min-w-max items-center gap-1 rounded-xl border border-border bg-surface p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-[color,background-color,border-color,box-shadow,transform,opacity,filter] ${
                    filter === "all"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t.work.filterAll} ({projects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("completed")}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-[color,background-color,border-color,box-shadow,transform,opacity,filter] ${
                    filter === "completed"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t.work.filterCompleted} (
                  {projects.filter((p) => !p.status || p.status === "completed").length}
                  )
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("in_progress")}
                  className={`flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-[color,background-color,border-color,box-shadow,transform,opacity,filter] ${
                    filter === "in_progress"
                      ? "bg-amber-500 font-semibold text-black shadow-xs"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                  </span>
                  {t.work.filterInProgress} (
                  {projects.filter((p) => p.status === "in_progress").length}
                  )
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title={t.work.empty} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState icon={FolderKanban} title={isId ? "Tidak ada proyek dalam kategori ini." : "No projects in this category."} />
      ) : (
        <RevealStagger key={filter} className="grid gap-6 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </RevealStagger>
      )}
    </section>
  );
}
