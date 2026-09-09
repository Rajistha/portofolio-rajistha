import { createClient } from "@/lib/supabase/server";
import type { Profile, Project, TechStack } from "@/types/database";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profile").select("*").limit(1).maybeSingle();
  if (error) console.error("getProfile:", error.message);
  return data;
}

export async function getTechStacks(): Promise<TechStack[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tech_stacks")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) console.error("getTechStacks:", error.message);
  return data ?? [];
}

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

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_tech_stacks(tech_stacks(*))")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) console.error("getProjects:", error.message);
  return (data as unknown as ProjectRow[] | null ?? []).map(flattenProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_tech_stacks(tech_stacks(*))")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("getProjectById:", error.message);
  if (!data) return null;
  return flattenProject(data as unknown as ProjectRow);
}
