"use client";

import { useEffect } from "react";
import { useLanguage } from "@/components/language-provider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-sm text-accent">{t.error.eyebrow}</p>
      <h1 className="font-display text-3xl sm:text-4xl">{t.error.title}</h1>
      <p className="max-w-md text-muted">{t.error.description}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
      >
        {t.error.retry}
      </button>
    </main>
  );
}
