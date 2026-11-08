"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __portfolio_ready?: boolean;
  }
}

export function HydrationSignal() {
  useEffect(() => {
    window.__portfolio_ready = true;
    window.dispatchEvent(new Event("portfolio:ready"));
  }, []);

  return null;
}
