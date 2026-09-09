import Link from "next/link";
import { FolderKanban, Sparkles, ArrowUpRight } from "lucide-react";
import { getProjects, getTechStacks } from "@/lib/data";

export default async function AdminDashboardPage() {
  const [projects, techStacks] = await Promise.all([getProjects(), getTechStacks()]);

  const stats = [
    { label: "Projects", value: projects.length, href: "/admin/projects", icon: FolderKanban },
    { label: "Tech Stack items", value: techStacks.length, href: "/admin/tech-stack", icon: Sparkles },
  ];

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Dashboard</h1>
      <p className="mb-10 text-muted">Manage your portfolio content.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="group flex items-center justify-between rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/40"
          >
            <div>
              <p className="mb-2 text-sm text-muted">{stat.label}</p>
              <p className="font-display text-4xl">{stat.value}</p>
            </div>
            <div className="flex flex-col items-end gap-2 text-muted">
              <stat.icon className="h-6 w-6" />
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/admin/projects/new"
          className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          + Add new project
        </Link>
        <Link
          href="/"
          target="_blank"
          className="rounded-xl border border-border px-5 py-2.5 text-sm text-foreground/90 hover:border-accent/40"
        >
          View live site
        </Link>
      </div>
    </div>
  );
}
