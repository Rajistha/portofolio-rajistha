"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-sm text-accent">{t.notFound.code}</p>
      <h1 className="font-display text-3xl sm:text-4xl">{t.notFound.title}</h1>
      <p className="max-w-md text-muted">{t.notFound.description}</p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
      >
        {t.notFound.back}
      </Link>
    </main>
  );
}
