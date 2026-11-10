"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import type { Profile } from "@/types/database";

export function Footer({
  name,
  hasBlog = false,
}: {
  name: string;
  profile: Profile | null;
  hasBlog?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <footer className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {name}. {t.footer.rights}
        </p>
        {hasBlog && (
          <Link href="/blog" className="transition-colors hover:text-accent">
            Blog
          </Link>
        )}
      </div>
    </footer>
  );
}
