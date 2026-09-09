const ALLOWED_SCHEMES = ["http:", "https:"];

/**
 * Rejects dangerous URL schemes (e.g. `javascript:`) before they're stored
 * and later rendered as a raw `href` on the public site.
 */
export function isSafeUrl(value: string): boolean {
  try {
    return ALLOWED_SCHEMES.includes(new URL(value).protocol);
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
