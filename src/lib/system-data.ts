import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Read-only diagnostics for the admin "Sistem" page. Uses the service role so
// row counts are accurate regardless of RLS. Secrets are never returned, only
// whether they are configured.

const TABLES = [
  "projects",
  "tech_stacks",
  "project_tech_stacks",
  "profile",
  "blog_posts",
  "contact_messages",
  "analytics_events",
  "short_links",
  "experiences",
  "testimonials",
  "portfolio_stats",
  "site_settings",
] as const;

export type TableInfo = { name: string; count: number | null; error?: string };
export type BucketInfo = { name: string; public: boolean; files: number | null; bytes: number | null };
type Check = { ok: boolean; latencyMs: number | null; error?: string };

export type SystemInfo = {
  host: string | null;
  projectRef: string | null;
  env: { name: string; set: boolean }[];
  database: Check;
  auth: Check;
  tables: TableInfo[];
  buckets: BucketInfo[];
  storageError?: string;
};

const ENV_KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];

function parseUrl(raw: string | undefined) {
  try {
    const host = new URL(raw ?? "").hostname;
    const ref = host.endsWith(".supabase.co") ? host.split(".")[0] : null;
    return { host, ref };
  } catch {
    return { host: null, ref: null };
  }
}

async function timed<T>(fn: () => Promise<T>): Promise<{ value?: T; ms: number; error?: string }> {
  const start = performance.now();
  try {
    const value = await fn();
    return { value, ms: Math.round(performance.now() - start) };
  } catch (e) {
    return { ms: Math.round(performance.now() - start), error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const { host, ref } = parseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const env = ENV_KEYS.map((name) => ({ name, set: Boolean(process.env[name]) }));

  const base: SystemInfo = {
    host,
    projectRef: ref,
    env,
    database: { ok: false, latencyMs: null },
    auth: { ok: false, latencyMs: null },
    tables: [],
    buckets: [],
  };
  if (!host || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ...base, database: { ok: false, latencyMs: null, error: "Environment Supabase belum lengkap." } };
  }

  const admin = createAdminClient();

  const [tables, db, auth, buckets] = await Promise.all([
    Promise.all(
      TABLES.map(async (name): Promise<TableInfo> => {
        const { count, error } = await admin.from(name).select("*", { count: "exact", head: true });
        return error ? { name, count: null, error: error.message } : { name, count };
      })
    ),
    timed(async () => {
      const { error } = await admin.from("site_settings").select("*", { head: true, count: "exact" });
      if (error) throw new Error(error.message);
    }),
    timed(async () => {
      const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (error) throw new Error(error.message);
    }),
    timed(async () => {
      const { data, error } = await admin.storage.listBuckets();
      if (error) throw new Error(error.message);
      return Promise.all(
        data.map(async (b): Promise<BucketInfo> => {
          const { data: files, error: listError } = await admin.storage.from(b.name).list("", { limit: 1000 });
          if (listError || !files) return { name: b.name, public: b.public, files: null, bytes: null };
          // Folders come back without an id; count real objects only.
          const objects = files.filter((f) => f.id);
          const bytes = objects.reduce((sum, f) => sum + (Number(f.metadata?.size) || 0), 0);
          return { name: b.name, public: b.public, files: objects.length, bytes };
        })
      );
    }),
  ]);

  return {
    ...base,
    database: { ok: !db.error, latencyMs: db.ms, error: db.error },
    auth: { ok: !auth.error, latencyMs: auth.ms, error: auth.error },
    tables,
    buckets: buckets.value ?? [],
    storageError: buckets.error,
  };
}
