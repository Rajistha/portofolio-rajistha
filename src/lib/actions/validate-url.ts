const ALLOWED_SCHEMES = ["http:", "https:"];

/**
 * Normalizes a URL: if the user typed "www.example.com" or "github.com/foo",
 * automatically prepends "https://" so it's a valid safe URL.
 */
export function normalizeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Lowercase scheme if typed like "Https://"
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\//i, "http://").replace(/^https:\/\//i, "https://");
  }

  // Already has another scheme
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Common pattern like www.something.com or domain.ext/path
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Rejects dangerous URL schemes (e.g. `javascript:`) before they're stored
 * and later rendered as a raw `href` on the public site.
 */
export function isSafeUrl(value: string): boolean {
  try {
    const normalized = normalizeUrl(value);
    if (!normalized) return false;
    return ALLOWED_SCHEMES.includes(new URL(normalized).protocol);
  } catch {
    return false;
  }
}

/**
 * Validates a set of optional URL fields, returning an error message for the
 * first unsafe one, or null if all are safe (or empty).
 */
export function findUnsafeUrl(fields: Record<string, string | null>): string | null {
  for (const [name, value] of Object.entries(fields)) {
    if (value && !isSafeUrl(value)) {
      return `${name} must be a valid http:// or https:// URL.`;
    }
  }
  return null;
}
