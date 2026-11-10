import { createClient } from "@/lib/supabase/server";
import type { AnalyticsEvent, BlogPost, ContactMessage } from "@/types/database";

// Reads for the admin dashboard. They use the signed-in session so RLS
// ("authenticated" policies) decides what is visible, and each one degrades to
// an empty result when its table hasn't been created yet.

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    return error ? [] : data ?? [];
  } catch {
    return [];
  }
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
    return error ? null : data;
  } catch {
    return null;
  }
}

export async function getMessages(): Promise<ContactMessage[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return error ? [] : data ?? [];
  } catch {
    return [];
  }
}

export async function getUnreadMessageCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    return error ? 0 : count ?? 0;
  } catch {
    return 0;
  }
}

export async function getAnalyticsEvents(days: number): Promise<{ events: AnalyticsEvent[]; ready: boolean }> {
  try {
    const supabase = await createClient();
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20000);
    if (error) return { events: [], ready: false };
    return { events: (data as AnalyticsEvent[] | null) ?? [], ready: true };
  } catch {
    return { events: [], ready: false };
  }
}

export type UnreadSummary = {
  count: number;
  latest: Pick<ContactMessage, "id" | "name" | "subject" | "message" | "created_at">[];
};

export async function getUnreadSummary(limit = 5): Promise<UnreadSummary> {
  try {
    const supabase = await createClient();
    const [{ count, error: countError }, { data, error }] = await Promise.all([
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
      supabase
        .from("contact_messages")
        .select("id, name, subject, message, created_at")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);
    if (countError || error) return { count: 0, latest: [] };
    return { count: count ?? 0, latest: data ?? [] };
  } catch {
    return { count: 0, latest: [] };
  }
}
