import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { getSystemInfo } from "@/lib/system-data";
import { cn } from "@/lib/utils";

export const revalidate = 0;

export const metadata: Metadata = { title: "Sistem" };

function formatBytes(bytes: number | null) {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Status({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", ok ? "text-accent" : "text-red-500")}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted/70">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="min-w-0 truncate text-muted">{label}</span>
      <span className="shrink-0 text-right font-mono text-xs">{children}</span>
    </div>
  );
}

export default async function AdminSystemPage() {
  const info = await getSystemInfo();
  const error = info.database.error ?? info.auth.error ?? info.storageError;

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Sistem</h1>
      <p className="mb-8 text-sm text-muted">Informasi koneksi dan penggunaan Supabase. Hanya-baca.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Proyek">
          <Row label="Host">{info.host ?? "—"}</Row>
          <Row label="Project ref">{info.projectRef ?? "—"}</Row>
          <Row label="Dashboard">
            {info.projectRef ? (
              <a
                href={`https://supabase.com/dashboard/project/${info.projectRef}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Buka Supabase
              </a>
            ) : (
              "—"
            )}
          </Row>
        </Card>

        <Card title="Koneksi">
          <Row label="Database">
            <Status ok={info.database.ok} label={info.database.ok ? `OK · ${info.database.latencyMs} ms` : "Gagal"} />
          </Row>
          <Row label="Auth">
            <Status ok={info.auth.ok} label={info.auth.ok ? `OK · ${info.auth.latencyMs} ms` : "Gagal"} />
          </Row>
          <Row label="Storage">
            <Status
              ok={!info.storageError && info.buckets.length > 0}
              label={info.storageError ? "Gagal" : `${info.buckets.length} bucket`}
            />
          </Row>
          {error && <p className="mt-3 break-words text-xs text-red-500">{error}</p>}
        </Card>

        <Card title="Environment">
          {info.env.map((e) => (
            <Row key={e.name} label={e.name}>
              <Status ok={e.set} label={e.set ? "Terisi" : "Kosong"} />
            </Row>
          ))}
        </Card>

        <Card title="Storage">
          {info.buckets.length === 0 ? (
            <p className="text-sm text-muted">Tidak ada bucket.</p>
          ) : (
            info.buckets.map((b) => (
              <Row key={b.name} label={`${b.name} · ${b.public ? "publik" : "privat"}`}>
                {b.files ?? "—"} file · {formatBytes(b.bytes)}
              </Row>
            ))
          )}
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Tabel database">
          {info.tables.length === 0 ? (
            <p className="text-sm text-muted">Tidak dapat membaca tabel.</p>
          ) : (
            <div className="grid gap-x-8 sm:grid-cols-2">
              {info.tables.map((t) => (
                <Row key={t.name} label={t.name}>
                  {t.error ? (
                    <span className="text-red-500" title={t.error}>
                      error
                    </span>
                  ) : (
                    `${t.count ?? 0} baris`
                  )}
                </Row>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
