"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Logo } from "@/components/ui/logo";

const SESSION_KEY = "portfolio_intro_v4";
const INTRO_DURATION_MS = 3400; // ~3.4s fill + 200ms pause + 850ms swipe = ~4.4s total

export function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);

    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // sessionStorage might fail in strict private mode
    }

    // Unmount from DOM strictly after the 850ms swipe-up transition finishes
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, 900);
  }, [closing]);

  useEffect(() => {
    setMounted(true);

    // Check if user has already seen the intro in this browser tab/session
    try {
      const hasSeen = sessionStorage.getItem(SESSION_KEY);
      if (hasSeen === "true") {
        setVisible(false);
        return; // Bypassed on refresh / subsequent visits
      }
    } catch {
      // If sessionStorage blocked, continue showing once
    }

    // First visit: show preloader
    setVisible(true);

    const startTime = performance.now();

    const updateFrame = () => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(Math.round((elapsed / INTRO_DURATION_MS) * 100), 100);
      setProgress(pct);

      if (pct < 100) {
        animFrameRef.current = requestAnimationFrame(updateFrame);
      } else {
        // Reached 100%: brief pause then smooth upward swipe!
        timerRef.current = setTimeout(() => {
          dismiss();
        }, 220);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);

    // Fail-safe hard timeout: under NO circumstances will preloader remain stuck
    const safetyTimeout = setTimeout(() => {
      dismiss();
    }, 4600);

    // ESC key listener to skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(safetyTimeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismiss]);

  // Don't render anything on SSR or once dismissed
  if (!mounted || !visible) return null;

  const getStatusText = (val: number) => {
    if (val < 25) return "> Initializing developer environment...";
    if (val < 52) return "> Compiling 3D interactive engine...";
    if (val < 78) return "> Fetching tech stack & projects...";
    if (val < 98) return "> Optimizing interface layout...";
    return "> System ready // Welcome!";
  };

  return (
    <>
      <style jsx global>{`
        @keyframes introProgressFill {
          0% { width: 0%; }
          25% { width: 32%; }
          55% { width: 68%; }
          80% { width: 88%; }
          100% { width: 100%; }
        }
        .intro-progress-bar {
          animation: introProgressFill 3.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .intro-dismissed #preloader-root {
          display: none !important;
        }
      `}</style>

      {/* Main Curtain Container with Smooth Swipe-Up (TranslateY -100%) */}
      <div
        id="preloader-root"
        onClick={dismiss}
        role="dialog"
        aria-label="Website Loading Intro"
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0b] text-[#ededec] overflow-hidden select-none cursor-pointer border-b border-accent/40 shadow-[0_25px_60px_rgba(0,0,0,0.95)] transition-transform duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform ${
          closing ? "-translate-y-full pointer-events-none" : "translate-y-0"
        }`}
      >
        {/* Subtle Cyber Grid Background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hero-grid opacity-35"
        />

        {/* Content Container (Gently floats upward and fades as curtain lifts) */}
        <div
          className={`relative z-10 flex flex-col items-center text-center px-6 pointer-events-none transition-all duration-400 ease-in ${
            closing ? "-translate-y-10 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {/* Logo R */}
          <div className="mb-7 transform transition-transform duration-300 hover:scale-105">
            <Logo size={78} />
          </div>

          {/* Name & Accent Dot */}
          <h2 className="mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Puja Rajistha
            <span className="text-accent">.</span>
          </h2>

          {/* Sleek Progress Container */}
          <div className="w-68 sm:w-80 space-y-3">
            {/* Progress Track */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2 border border-border/60 p-[1px]">
              <div
                className="intro-progress-bar h-full rounded-full bg-gradient-to-r from-accent via-[#ff7b54] to-[#ff9e7d] shadow-[0_0_12px_rgba(255,107,74,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Status Line & Percentage Counter */}
            <div className="flex items-center justify-between text-xs font-mono text-muted">
              <span className="truncate pr-2 text-left">{getStatusText(progress)}</span>
              <span className="font-semibold text-foreground font-mono shrink-0 tabular-nums">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom edge glowing accent bar that sweeps up across the screen */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
        />

        {/* Skip instructions */}
        <div
          className={`absolute bottom-6 inset-x-0 flex justify-center text-xs text-muted/60 font-mono pointer-events-none transition-opacity duration-200 ${
            closing ? "opacity-0" : "opacity-100"
          }`}
        >
          [Klik layar atau tekan ESC untuk skip]
        </div>
      </div>
    </>
  );
}
