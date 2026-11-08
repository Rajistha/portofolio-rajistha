"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/actions/require-auth";
import type { ActionResult } from "@/lib/actions/projects";

export async function createTechStack(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const color = String(formData.get("color") ?? "").trim().replace(/^#/, "") || null;
  const category = String(formData.get("category") ?? "").trim() || "Other";
  const sort_order = Number(formData.get("sort_order") ?? 0) || 0;

  if (!name || !slug) return { error: "Name and slug are required." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tech_stacks")
    .insert({ name, slug, color, category, sort_order })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/tech-stack");
  return { id: data.id };
}

export async function deleteTechStack(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const admin = createAdminClient();
  // Ensure relations are cleared
  await admin.from("project_tech_stacks").delete().eq("tech_stack_id", id);

  const { error } = await admin.from("tech_stacks").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/tech-stack");
  return {};
}
