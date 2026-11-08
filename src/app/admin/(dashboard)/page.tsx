import Link from "next/link";
import { FolderKanban, Sparkles, ArrowUpRight, Briefcase, MessageSquare, BarChart3, Link2, ExternalLink, Plus } from "lucide-react";
import { getProjects, getTechStacks, getExperiences, getTestimonials, getStats } from "@/lib/data";
import { getShortLinks } from "@/lib/actions/links";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [projects, techStacks, experiences, testimonials, statsData, shortLinks] = await Promise.all([
    getProjects(),
    getTechStacks(),
    getExperiences(),
    getTestimonials(),
    getStats(),
    getShortLinks(false),
  ]);

  const cards = [
    { label: "Projects", value: projects.length, href: "/admin/projects", icon: FolderKanban },
    { label: "Tech Stack", value: techStacks.length, href: "/admin/tech-stack", icon: Sparkles },
    { label: "Rekam Jejak", value: experiences.length, href: "/admin/experiences", icon: Briefcase },
    { label: "Testimoni Klien", value: testimonials.length, href: "/admin/testimonials", icon: MessageSquare },
    { label: "Statistik Portofolio", value: statsData.length, href: "/admin/stats", icon: BarChart3 },
    { label: "Short Links", value: shortLinks.length, href: "/admin/links", icon: Link2 },
  ];

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Dashboard</h1>
      <p className="mb-8 text-muted text-sm">Kelola seluruh konten portofolio dan tautan subdomain Anda.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-center justify-between rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <div>
              <p className="mb-1 text-xs font-medium text-muted">{card.label}</p>
              <p className="font-display text-3xl font-bold">{card.value}</p>
            </div>
            <div className="flex flex-col items-end gap-2 text-muted">
              <card.icon className="h-5 w-5 text-accent" />
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-accent transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Proyek
        </Link>
        <Link
          href="/admin/links"
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent/40 transition-colors"
        >
          Kelola Shortlinks
        </Link>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm text-foreground/90 hover:border-accent/40 transition-colors"
        >
          <span>Lihat Web</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
