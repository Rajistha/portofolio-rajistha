"use client";

import { useEffect, useState } from "react";

type Phase = "idle" | "typing" | "deleting";

export function Typewriter({
  text,
  startDelay = 0,
  typeSpeed = 45,
  deleteSpeed = 25,
  pauseDuration = 1800,
  waitDuration = 500,
  loop = true,
  className,
}: {
  text: string;
  startDelay?: number;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  waitDuration?: number;
  loop?: boolean;
  className?: string;
}) {
  // Start assuming motion is fine (matches the server-rendered default) and
  // correct from matchMedia after mount — checking it in a lazy useState
  // initializer would run during the client's first (hydration) render too,
  // which can disagree with the server-rendered HTML and trigger a real
  // hydration mismatch, not just a cosmetic flash.
  const [reducedMotion, setReducedMotion] = useState(false);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Syncing from matchMedia, which is only readable after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReducedMotion(true);
    }
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setTimeout(() => setPhase("typing"), startDelay * 1000);
    return () => clearTimeout(timer);
  }, [reducedMotion, startDelay]);

  useEffect(() => {
    if (reducedMotion || phase === "idle") return;

    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (count < text.length) {
        timer = setTimeout(() => setCount((c) => c + 1), typeSpeed);
      } else if (loop) {
        timer = setTimeout(() => setPhase("deleting"), pauseDuration);
      }
    } else if (phase === "deleting") {
      if (count > 0) {
        timer = setTimeout(() => setCount((c) => c - 1), deleteSpeed);
      } else {
        timer = setTimeout(() => setPhase("typing"), waitDuration);
      }
    }

    return () => clearTimeout(timer);
  }, [phase, count, reducedMotion, text, typeSpeed, deleteSpeed, pauseDuration, waitDuration, loop]);

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span aria-label={text} className={className}>
      <span aria-hidden>{text.slice(0, count)}</span>
      <span
        aria-hidden
        className="ml-0.5 inline-block w-0.5 translate-y-[0.1em] animate-pulse bg-accent align-middle"
        style={{ height: "1em" }}
      />
    </span>
  );
}
