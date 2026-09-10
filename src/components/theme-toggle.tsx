"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required to avoid SSR/client theme mismatch
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("h-9 w-9 rounded-md border border-border", className)} aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || prefersReducedMotion) {
      setTheme(next);
      return;
    }

    const button = buttonRef.current;
    const { left = 0, top = 0, width = 0, height = 0 } = button?.getBoundingClientRect() ?? {};
    const x = left + width / 2;
    const y = top + height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // The lanyard's continuous physics/WebGL render loop competes with the
    // main thread for frames during the clip-path animation, making the
    // circular reveal look choppy — pause it for the duration of the wipe.
    window.dispatchEvent(new Event("theme-transition-start"));

    const transition = doc.startViewTransition(() => {
      setTheme(next);
    });

    transition.ready.then(() => {
      const animation = document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 550,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
      animation.finished.finally(() => {
        window.dispatchEvent(new Event("theme-transition-end"));
      });
    });
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
