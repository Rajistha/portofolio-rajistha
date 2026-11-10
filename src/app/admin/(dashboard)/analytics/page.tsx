import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { getAnalyticsEvents } from "@/lib/admin-data";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { AnalyticsEvent } from "@/types/database";

export const revalidate = 0;

export const metadata: Metadata = { title: "Analytics" };

const RANGES = [7, 30, 90] as const;

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** One bucket per day in range, oldest first, so empty days still show. */
function dailySeries(views: AnalyticsEvent[], days: number): [string, number][] {
  const now = Date.now();
  const perDay = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) perDay.set(dayKey(new Date(now - i * 86_400_000)), 0);
  for (const view of views) {
    const key = dayKey(new Date(view.created_at));
    if (perDay.has(key)) perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }
  return [...perDay.entries()];
}

function countBy(events: AnalyticsEvent[], pick: (e: AnalyticsEvent) => string | null) {
  const map = new Map<string, number>();
  for (const event of events) {
    const key = pick(event);
    if (key) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = RANGES.find((r) => String(r) === range) ?? 30;
  const { events, ready } = await getAnalyticsEvents(days);

  const views = events.filter((e) => e.type === "view");
  const cvDownloads = events.filter((e) => e.type === "cv_download").length;
  const contactClicks = events.filter((e) => e.type === "contact_click").length;
  const projectOpens = events.filter((e) => e.type === "project_open");

  const series = dailySeries(views, days);
  const peak = Math.max(1, ...series.map(([, count]) => count));

  const topPages = countBy(views, (e) => e.path).slice(0, 6);
  const topProjects = countBy(projectOpens, (e) => e.label).slice(0, 6);
  const referrers = countBy(views, (e) => e.referrer).slice(0, 6);
  const devices = countBy(views, (e) => e.device);

  const summary = [
    { label: "Kunjungan halaman", value: views.length },
    { label: "Unduhan CV", value: cvDownloads },
    { label: "Proyek dibuka", value: projectOpens.length },
    { label: "Klik kontak", value: contactClicks },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Analytics</h1>
          <p className="text-muted">Ringkasan {days} hari terakhir. Kunjungan Anda sendiri tidak dihitung.</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-surface p-1 text-xs">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?range=${r}`}
              className={cn(
                "rounded-lg px-3 py-1.5 transition-colors",
                r === days ? "bg-foreground text-background" : "text-muted hover:text-foreground"
              )}
            >
              {r} hari
            </Link>
          ))}
        </div>
      </div>

      {!ready ? (
        <EmptyState
          icon={BarChart3}
          title="Data analytics belum tersedia"
          description="Data pengunjung akan tampil di sini setelah ada yang membuka website."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-surface p-5">
                <p className="mb-1 text-xs font-medium text-muted">{item.label}</p>
                <p className="font-display text-3xl font-bold tabular-nums">{item.value.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-border bg-surface p-5" aria-label="Kunjungan per hari">
            <h2 className="mb-4 text-sm font-medium">Kunjungan per hari</h2>
            <div className="flex h-40 items-end gap-px sm:gap-0.5">
              {series.map(([day, count]) => (
                <div
                  key={day}
                  title={`${day}: ${count} kunjungan`}
                  className="flex h-full flex-1 items-end"
                >
                  <div
                    className="w-full min-h-px rounded-t-sm bg-accent/70 transition-colors hover:bg-accent"
                    style={{ height: `${(count / peak) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
              <span>{series[0]?.[0]}</span>
              <span>{series[series.length - 1]?.[0]}</span>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <RankList title="Halaman terpopuler" rows={topPages} />
            <RankList title="Proyek paling sering dibuka" rows={topProjects} />
            <RankList title="Sumber trafik" rows={referrers} emptyText="Belum ada rujukan eksternal." />
            <RankList title="Perangkat" rows={devices} />
          </div>
        </div>
      )}
    </div>
  );
}

function RankList({
  title,
  rows,
  emptyText = "Belum ada data.",
}: {
  title: string;
  rows: [string, number][];
  emptyText?: string;
}) {
  const max = Math.max(1, ...rows.map(([, count]) => count));

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 text-sm font-medium">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-xs text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map(([label, count]) => (
            <li key={label}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate">{label}</span>
                <span className="shrink-0 font-mono tabular-nums text-muted">{count}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-accent/70" style={{ width: `${(count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
