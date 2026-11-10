import type { AnalyticsEventType } from "@/types/database";

const IGNORE_KEY = "analytics_ignore";

/** Marks this browser as the site owner so their own visits aren't counted. */
export function ignoreThisBrowser() {
  try {
    window.localStorage.setItem(IGNORE_KEY, "1");
  } catch {
    // storage unavailable — nothing to do
  }
}

export function trackEvent(type: AnalyticsEventType, opts: { label?: string; path?: string } = {}) {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(IGNORE_KEY) === "1") return;
  } catch {
    // storage unavailable — track anyway
  }

  const payload = JSON.stringify({
    type,
    path: opts.path ?? window.location.pathname,
    label: opts.label,
    referrer: type === "view" ? document.referrer : undefined,
  });

  const sent =
    typeof navigator.sendBeacon === "function" &&
    navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));

  if (!sent) {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}
