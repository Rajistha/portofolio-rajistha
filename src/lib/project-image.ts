/**
 * Resolves the display image for a portfolio project.
 * Supports:
 * 1. Custom uploaded image (from Supabase Storage or external link)
 * 2. Auto-generated screenshot from live deployment URL (e.g. Vercel)
 * 3. Auto-generated OpenGraph card from GitHub repository
 */

export function getAutoScreenshotUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    const parsed = new URL(normalized);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;

    // Use our internal proxy endpoint with multi-engine failover
    return `/api/screenshot?url=${encodeURIComponent(parsed.href)}`;
  } catch {
    return null;
  }
}

export function getGitHubOgUrl(repoUrl: string | null | undefined): string | null {
  if (!repoUrl) return null;
  try {
    const parsed = new URL(repoUrl.trim());
    if (parsed.hostname === "github.com" || parsed.hostname.endsWith(".github.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const owner = parts[0];
        const repo = parts[1].replace(/\.git$/, "");
        return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export type ResolvedProjectImage = {
  url: string | null;
  isAuto: boolean;
  source: "manual" | "live_screenshot" | "github_og" | "none";
};

export function resolveProjectImage(project: {
  image_url?: string | null;
  live_url?: string | null;
  repo_url?: string | null;
}): ResolvedProjectImage {
  if (project.image_url && project.image_url.trim()) {
    return { url: project.image_url.trim(), isAuto: false, source: "manual" };
  }

  if (project.live_url && project.live_url.trim()) {
    const autoUrl = getAutoScreenshotUrl(project.live_url);
    if (autoUrl) {
      return { url: autoUrl, isAuto: true, source: "live_screenshot" };
    }
  }

  if (project.repo_url && project.repo_url.trim()) {
    const githubUrl = getGitHubOgUrl(project.repo_url);
    if (githubUrl) {
      return { url: githubUrl, isAuto: true, source: "github_og" };
    }
  }

  return { url: null, isAuto: false, source: "none" };
}
