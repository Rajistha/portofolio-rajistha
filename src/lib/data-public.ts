import { createPublicClient } from "@/lib/supabase/public";
import type { BlogPost, Profile, Project, SiteSettings, TechStack } from "@/types/database";

// Cacheable reads that don't depend on the visitor's cookies, so the pages
// using them can be statically rendered and revalidated.

type ProjectRow = Project & {
  project_tech_stacks: { tech_stacks: TechStack }[];
};

function flattenProject(row: ProjectRow): Project {
  const { project_tech_stacks, ...rest } = row;
  return {
    ...rest,
    tech_stacks: (project_tech_stacks ?? []).map((pts) => pts.tech_stacks),
  };
}

const PROJECT_SELECT = "*, project_tech_stacks(tech_stacks(*))";

export async function getAllProjectsPublic(): Promise<Project[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("projects")
      .select(PROJECT_SELECT)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return [];
    return ((data as unknown as ProjectRow[] | null) ?? []).map(flattenProject);
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const { data, error } = await createPublicClient()
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return flattenProject(data as unknown as ProjectRow);
  } catch {
    return null;
  }
}

export async function getPublishedPosts(limit?: number): Promise<BlogPost[]> {
  try {
    let query = createPublicClient()
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await createPublicClient()
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = { preloader_enabled: true, lanyard_enabled: true };
  try {
    const { data, error } = await createPublicClient()
      .from("site_settings")
      .select("preloader_enabled, lanyard_enabled")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return defaults;
    return data;
  } catch {
    return defaults;
  }
}

export async function getProfilePublic(): Promise<Profile | null> {
  try {
    const { data, error } = await createPublicClient().from("profile").select("*").limit(1).maybeSingle();
    return error ? null : data;
  } catch {
    return null;
  }
}
