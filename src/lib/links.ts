import type { ShortLink } from "@/types/database";

export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "links",
  "blog",
  "projects",
  "s",
  "icon",
  "sitemap",
  "sitemap.xml",
  "robots",
  "robots.txt",
  "favicon.ico",
  "login",
  "opengraph-image",
  "_next",
]);

export const FALLBACK_SHORT_LINKS: ShortLink[] = [
  {
    id: "fb-1",
    slug: "cv",
    destination_url: "https://rajistha.my.id",
    title: "Curriculum Vitae (CV)",
    description: "Unduh resume / CV terbaru Puja Rajistha",
    clicks: 42,
    is_pinned: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fb-2",
    slug: "wa",
    destination_url: "https://wa.me/6281234567890?text=Halo%20Puja%20Rajistha,%20saya%20tertarik%20berdiskusi%20mengenai%20proyek%20web",
    title: "WhatsApp Official",
    description: "Hubungi langsung melalui WhatsApp untuk konsultasi kilat",
    clicks: 89,
    is_pinned: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fb-3",
    slug: "memori",
    destination_url: "https://memoribox.id",
    title: "MemoriBox.id Photobooth",
    description: "Platform web operasional photobooth modern di Malang",
    clicks: 124,
    is_pinned: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fb-4",
    slug: "snaphub",
    destination_url: "https://snaphub.my.id",
    title: "SnapHub Photobooth",
    description: "Web apps layanan sewa photobooth premium",
    clicks: 98,
    is_pinned: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function cleanSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/(^-|-$)/g, "");
}

export function generateRandomSlug(length = 6): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
