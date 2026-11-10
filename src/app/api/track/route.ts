import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = new Set(["view", "cv_download", "project_open", "contact_click"]);
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|lighthouse|headless|curl|wget|facebookexternalhit/i;

function deviceFromUserAgent(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function referrerHost(referrer: unknown, ownHost: string | null): string | null {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host || (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0])) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_PATTERN.test(ua)) return new NextResponse(null, { status: 204 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`track:${ip}`, 60, 60_000)) return new NextResponse(null, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type : "";
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "";
  if (!ALLOWED_TYPES.has(type) || !path.startsWith("/") || path.startsWith("/admin")) {
    return new NextResponse(null, { status: 400 });
  }

  const label = typeof body.label === "string" ? body.label.slice(0, 160) : null;

  try {
    const { error } = await createAdminClient()
      .from("analytics_events")
      .insert({
        type,
        path,
        label,
        referrer: referrerHost(body.referrer, request.headers.get("host")),
        device: deviceFromUserAgent(ua),
      });
    if (error) console.error("track:", error.message);
  } catch (err) {
    console.error("track:", err);
  }

  return new NextResponse(null, { status: 204 });
}
