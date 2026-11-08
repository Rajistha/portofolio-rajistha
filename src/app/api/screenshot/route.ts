import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Unified live website screenshot proxy endpoint.
 *
 * Captures real desktop screenshots of the live webpage (from y=0),
 * preserving the website's navigation bar, brand header, and layout.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let normalized = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new NextResponse("Invalid protocol", { status: 400 });
    }

    // Engine 1: 11ty Desktop Screenshot API (Captures full page with top navbar)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7500);
      const res = await fetch(
        `https://v1.screenshot.11ty.dev/${encodeURIComponent(parsed.href)}/large/`,
        {
          signal: controller.signal,
          headers: {
            Accept: "image/jpeg,image/png,*/*",
          },
        }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 1500) {
          const contentType = res.headers.get("content-type") || "image/jpeg";
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
            },
          });
        }
      }
    } catch {
      // Fall through to Engine 2
    }

    // Engine 2: Thum.io public endpoint (Wide desktop viewport from top)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7500);
      const res = await fetch(
        `https://image.thum.io/get/width/1280/crop/800/${parsed.href}`,
        {
          signal: controller.signal,
          headers: {
            Accept: "image/png,*/*",
          },
        }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 1500) {
          const contentType = res.headers.get("content-type") || "image/png";
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
            },
          });
        }
      }
    } catch {
      // Fall through
    }

    // Engine 3: Check og:image as last-resort fallback if headless capture fails
    try {
      const htmlController = new AbortController();
      const htmlTimeout = setTimeout(() => htmlController.abort(), 3500);

      const htmlRes = await fetch(parsed.href, {
        signal: htmlController.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      clearTimeout(htmlTimeout);

      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const ogMatch =
          html.match(/<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i) ||
          html.match(/<meta[^>]+name=["'](?:twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["']/i);

        if (ogMatch && ogMatch[1]) {
          const ogUrl = new URL(ogMatch[1].trim(), parsed.href).href;
          const imgRes = await fetch(ogUrl);
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            return new NextResponse(buffer, {
              headers: {
                "Content-Type": imgRes.headers.get("content-type") || "image/png",
                "Cache-Control": "public, max-age=86400, s-maxage=86400",
              },
            });
          }
        }
      }
    } catch {
      // Fall through
    }

    return new NextResponse("Failed to capture live website screenshot", { status: 502 });
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}
