import { getTechStacks } from "@/lib/data";
import { createTechStack, deleteTechStack } from "@/lib/actions/tech-stacks";
import { DeleteButton } from "@/components/admin/delete-button";
import { TechStackForm } from "@/components/admin/tech-stack-form";
import { TechIcon } from "@/components/ui/tech-icon";

export default async function AdminTechStackPage() {
  const techStacks = await getTechStacks();
  const categories = Array.from(new Set(techStacks.map((t) => t.category)));

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Tech Stack</h1>
      <p className="mb-8 text-muted">
        Slugs must match{" "}
        <a
          href="https://simpleicons.org"
          target="_blank"
          rel="noreferrer"
          className="text-accent underline"
        >
          simpleicons.org
        </a>{" "}
        (e.g. &quot;react&quot;, &quot;nextdotjs&quot;, &quot;tailwindcss&quot;).
      </p>

      <TechStackForm action={createTechStack} categories={categories} />

      {categories.length === 0 ? (
        <p className="text-muted">No tech stack items yet.</p>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted">{category}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {techStacks
                  .filter((t) => t.category === category)
                  .map((tech) => (
                    <div
                      key={tech.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
                    >
                      <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={24} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{tech.name}</p>
                        <p className="truncate text-xs text-muted">{tech.slug}</p>
                      </div>
                      <DeleteButton
                        action={deleteTechStack.bind(null, tech.id)}
                        confirmMessage={`Delete "${tech.name}"?`}
                        successMessage="Tech stack removed."
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
