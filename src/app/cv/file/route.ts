import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/**
 * Branded CV URL (/cv). Streams the current CV from storage so the visitor
 * only ever sees this site's domain, never the storage host.
 */
export async function GET(request: Request) {
  const { data } = await createPublicClient().from("profile").select("cv_url").limit(1).maybeSingle();
  const cvUrl = data?.cv_url;
  if (!cvUrl) return NextResponse.redirect(new URL("/", request.url));

  const upstream = await fetch(cvUrl);
  if (!upstream.ok || !upstream.body) return NextResponse.redirect(new URL("/", request.url));

  const ext = new URL(cvUrl).pathname.split(".").pop()?.toLowerCase() || "pdf";
  const download = new URL(request.url).searchParams.has("download");

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="cv-puja-rajistha.${ext}"`,
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
