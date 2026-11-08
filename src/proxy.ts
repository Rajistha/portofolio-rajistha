import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Subdomain detection for s.rajistha.my.id or s.localhost
  const isShortSubdomain =
    host.startsWith("s.") || host.startsWith("short.") || host.includes("s.rajistha");

  if (isShortSubdomain) {
    // If root of subdomain, rewrite to public links hub
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/links";
      return NextResponse.rewrite(url);
    }
  }

  // Continue Supabase session handling for admin routes
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
