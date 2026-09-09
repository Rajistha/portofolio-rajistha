"use client";

import { Reveal, RevealStagger } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/site/project-card";
import { useLanguage } from "@/components/language-provider";
import type { Project } from "@/types/database";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const { t } = useLanguage();

  return (
    <section id="work" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h2 className="mb-14 font-display text-3xl sm:text-4xl">{t.work.title}</h2>
      </Reveal>

      {projects.length === 0 ? (
        <p className="text-muted">{t.work.empty}</p>
      ) : (
        <RevealStagger className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </RevealStagger>
      )}
    </section>
  );
}
