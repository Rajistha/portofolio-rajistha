"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Dictionary, type Language } from "@/lib/i18n/dictionaries";

const STORAGE_KEY = "language";
const DEFAULT_LANGUAGE: Language = "id";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start at the same default the server rendered, then correct from
  // localStorage after mount. Reading localStorage in a lazy useState
  // initializer would run during the client's first (hydration) render too,
  // which can differ from the server-rendered HTML and trigger a real
  // hydration mismatch — not just a cosmetic flash.
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "id" || stored === "en") {
      // Syncing from localStorage, which is only readable after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(stored);
    }
  }, []);

  function setLanguage(next: Language) {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: dictionaries[language] }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
