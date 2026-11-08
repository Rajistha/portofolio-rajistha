import { NextRequest, NextResponse } from "next/server";
import { getShortLinkBySlug, recordClick } from "@/lib/actions/links";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Ignore static assets / Next.js internals
  if (
    slug.startsWith("_") ||
    slug.includes(".") ||
    slug === "favicon" ||
    slug === "admin" ||
    slug === "api" ||
    slug === "links"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const shortLink = await getShortLinkBySlug(slug);

  if (!shortLink) {
    // If not found, redirect to public link hub with error toast query
    return NextResponse.redirect(new URL(`/links?notfound=${encodeURIComponent(slug)}`, request.url));
  }

  // Increment click count asynchronously (fire and forget so redirect is instant)
  recordClick(slug).catch(() => {});

  // 307 Temporary Redirect preserves SEO for target destination
  return NextResponse.redirect(shortLink.destination_url, { status: 307 });
}
