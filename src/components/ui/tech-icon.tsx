"use client";

import { useState } from "react";
import { Component } from "lucide-react";
import { cn } from "@/lib/utils";

type TechIconProps = {
  slug: string;
  name: string;
  color?: string | null;
  size?: number;
  className?: string;
};

/**
 * Renders a brand logo via the Simple Icons CDN using the tech's slug
 * (e.g. "react", "nextdotjs", "tailwindcss") — no local asset needed.
 * Falls back to a generic icon if the CDN request fails (offline, blocked
 * by an ad-blocker, CDN outage), instead of showing a broken-image icon.
 */
export function TechIcon({ slug, name, color, size = 28, className }: TechIconProps) {
  const [failed, setFailed] = useState(false);
  const cleanColor = color?.replace(/^#/, "");
  const src = `https://cdn.simpleicons.org/${slug}${cleanColor ? `/${cleanColor}` : ""}`;

  if (failed) {
    return (
      <Component
        aria-label={name}
        width={size}
        height={size}
        className={cn("inline-block shrink-0 opacity-70", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("inline-block object-contain", className)}
    />
  );
}
