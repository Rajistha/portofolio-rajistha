/** Lowercase, hyphen-separated, ASCII-only slug. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Clean storage filename: "My CV_v2.PDF" -> "my-cv-v2.pdf". */
export function slugifyFilename(filename: string, fallback = "file"): string {
  const dot = filename.lastIndexOf(".");
  const hasExt = dot > 0 && dot < filename.length - 1;
  const base = slugify(hasExt ? filename.slice(0, dot) : filename) || fallback;
  const ext = hasExt ? filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return ext ? `${base}.${ext}` : base;
}

/** Inserts a short random suffix before the extension: "cv.pdf" -> "cv-a1b2c3.pdf". */
export function withUniqueSuffix(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const suffix = Math.random().toString(36).slice(2, 8);
  return dot > 0
    ? `${filename.slice(0, dot)}-${suffix}${filename.slice(dot)}`
    : `${filename}-${suffix}`;
}
