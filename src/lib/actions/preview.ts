"use server";

/**
 * Fetches the OpenGraph image directly from a live website.
 * Most modern deployment frameworks (Next.js, Vercel, Vite, Astro)
 * render high-res `og:image` or `twitter:image` tags in their HTML head.
 */
export async function fetchWebsitePreview(rawUrl: string): Promise<{
  ogImage: string | null;
  title?: string | null;
}> {
  if (!rawUrl || typeof rawUrl !== "string") return { ogImage: null };
  const trimmed = rawUrl.trim();
  if (!trimmed) return { ogImage: null };

  let targetUrl = trimmed;
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    const parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { ogImage: null };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(parsed.href, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { ogImage: null };
    }

    const html = await res.text();

    // 1. Check og:image or twitter:image meta tags
    const match =
      html.match(/<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i) ||
      html.match(/<meta[^>]+name=["'](?:twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["'](?:twitter:image|twitter:image:src)["']/i);

    if (match && match[1]) {
      const resolved = new URL(match[1].trim(), parsed.href).href;
      return { ogImage: resolved };
    }

    return { ogImage: null };
  } catch {
    return { ogImage: null };
  }
}
