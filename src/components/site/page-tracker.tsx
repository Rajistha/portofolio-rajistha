"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ignoreThisBrowser, trackEvent } from "@/lib/track";

/** Records one page view per client-side navigation. Skips the admin area. */
export function PageTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      // The owner browsing the dashboard shouldn't inflate their own numbers.
      ignoreThisBrowser();
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackEvent("view", { path: pathname });
  }, [pathname]);

  return null;
}
