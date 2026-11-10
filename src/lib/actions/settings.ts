"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/actions/require-auth";
import type { ActionResult } from "@/lib/actions/projects";

export async function saveSiteSettings(settings: {
  preloader_enabled: boolean;
  lanyard_enabled: boolean;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const authError = await requireUser(supabase);
  if (authError) return { error: authError };

  const { error } = await createAdminClient()
    .from("site_settings")
    .upsert({
      id: 1,
      preloader_enabled: Boolean(settings.preloader_enabled),
      lanyard_enabled: Boolean(settings.lanyard_enabled),
      updated_at: new Date().toISOString(),
    });
  if (error) {
    console.error("save site_settings:", error.message);
    return {
      error: "Gagal menyimpan pengaturan. Silakan coba lagi.",
    };
  }

  revalidatePath("/", "layout");
  return {};
}
