"use client";

import { Reveal, RevealStagger, RevealStaggerItem } from "@/components/ui/reveal";
import { TechIcon } from "@/components/ui/tech-icon";
import { useLanguage } from "@/components/language-provider";
import type { TechStack } from "@/types/database";

export function TechStackSection({ techStacks }: { techStacks: TechStack[] }) {
  const { t } = useLanguage();
  const categories = Array.from(new Set(techStacks.map((tech) => tech.category)));

  return (
    <section id="stack" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h2 className="mb-14 font-display text-3xl sm:text-4xl">{t.stack.title}</h2>
      </Reveal>

      {techStacks.length === 0 ? (
        <p className="text-muted">{t.stack.empty}</p>
      ) : (
        <div className="space-y-10">
          {categories.map((category) => (
            <div key={category}>
              <p className="mb-4 text-xs font-medium text-muted">{category}</p>
              <RevealStagger className="flex flex-wrap gap-3">
                {techStacks
                  .filter((tech) => tech.category === category)
                  .map((tech) => {
                    const isMono = !tech.color || /^#?(000000|ffffff)$/i.test(tech.color);

                    return (
                      <RevealStaggerItem key={tech.id}>
                        <div className="group flex items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/50">
                          <TechIcon
                            slug={tech.slug}
                            name={tech.name}
                            color={isMono ? null : tech.color}
                            size={20}
                            className={
                              isMono
                                ? "icon-mono opacity-80 transition-opacity group-hover:opacity-100"
                                : "opacity-80 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-100"
                            }
                          />
                          <span className="text-sm text-foreground/90">{tech.name}</span>
                        </div>
                      </RevealStaggerItem>
                    );
                  })}
              </RevealStagger>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
