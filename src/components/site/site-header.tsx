import { createPublicClient } from "@/lib/supabase/public";
import { Navbar } from "@/components/site/navbar";
import { ScrollProgress } from "@/components/site/scroll-progress";

async function hasRows(table: "experiences" | "blog_posts"): Promise<boolean> {
  try {
    let query = createPublicClient().from(table).select("id", { count: "exact", head: true });
    if (table === "blog_posts") query = query.eq("published", true);
    const { count, error } = await query;
    return !error && (count ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Navbar + scroll progress for pages other than the home page. */
export async function SiteHeader() {
  const [hasExperience, hasBlog] = await Promise.all([hasRows("experiences"), hasRows("blog_posts")]);
  return (
    <>
      <ScrollProgress />
      <Navbar hasExperience={hasExperience} hasBlog={hasBlog} />
    </>
  );
}
