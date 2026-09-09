"use client";

import { useEffect } from "react";

/**
 * Shared behavior for mobile menu/drawer overlays: closes on Escape and
 * locks page scroll while open, so the page underneath doesn't scroll
 * behind the overlay.
 */
export function useDismissableOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);
}
