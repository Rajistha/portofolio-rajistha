"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/actions/require-auth";
import type { ActionResult } from "@/lib/actions/projects";

const TABLES = {
  projects: ["/", "/admin/projects"],
  experiences: ["/", "/admin/experiences"],
} as const;

type ReorderableTable = keyof typeof TABLES;

/** Persists a drag-and-drop order by writing each item's index to sort_order. */
export async function reorderItems(table: ReorderableTable, orderedIds: string[]): Promise<ActionResult> {
  if (!(table in TABLES)) return { error: "Tabel tidak valid." };
  if (orderedIds.length === 0 || orderedIds.length > 500) return { error: "Daftar urutan tidak valid." };

  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const admin = createAdminClient();
  const results = await Promise.all(
    orderedIds.map((id, index) => admin.from(table).update({ sort_order: index }).eq("id", id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  TABLES[table].forEach((path) => revalidatePath(path));
  return {};
}
