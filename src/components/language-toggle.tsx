"use client";

import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "id" ? "en" : "id")}
      aria-label={language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border border-border text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-accent",
        className
      )}
    >
      {language.toUpperCase()}
    </button>
  );
}
