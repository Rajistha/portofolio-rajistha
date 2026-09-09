import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireUser(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? null : "You must be signed in to do this.";
}
