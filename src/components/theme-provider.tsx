"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  // The admin area keeps its own theme preference, separate from the public site.
  const isAdmin = usePathname()?.startsWith("/admin") ?? false;
  const storageKey = isAdmin ? "admin-theme" : "theme";

  return (
    <NextThemesProvider key={storageKey} {...props} storageKey={storageKey}>
      {children}
    </NextThemesProvider>
  );
}
