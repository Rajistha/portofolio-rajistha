"use client";

import { useMemo } from "react";
import {
  Terminal,
  Code2,
  Camera,
  ShoppingBag,
  FolderGit2,
  Layers,
  Smartphone,
  Cpu,
  Globe,
  Database,
} from "lucide-react";
import { TechIcon } from "@/components/ui/tech-icon";
import type { Project } from "@/types/database";

type ThemeConfig = {
  gradient: string;
  badgeFrom: string;
  badgeTo: string;
  glow: string;
  accentText: string;
  borderAccent: string;
  dotColor: string;
};

const THEMES: ThemeConfig[] = [
  {
    gradient: "from-[#ff6b4a]/25 via-[#ff9068]/10 to-transparent",
    badgeFrom: "#ff6b4a",
    badgeTo: "#d63f18",
    glow: "rgba(255, 107, 74, 0.35)",
    accentText: "text-[#ff7b54]",
    borderAccent: "border-[#ff6b4a]/30",
    dotColor: "bg-[#ff6b4a]",
  },
  {
    gradient: "from-[#06b6d4]/25 via-[#3b82f6]/10 to-transparent",
    badgeFrom: "#06b6d4",
    badgeTo: "#2563eb",
    glow: "rgba(6, 182, 212, 0.35)",
    accentText: "text-[#22d3ee]",
    borderAccent: "border-[#06b6d4]/30",
    dotColor: "bg-[#06b6d4]",
  },
  {
    gradient: "from-[#8b5cf6]/25 via-[#ec4899]/10 to-transparent",
    badgeFrom: "#8b5cf6",
    badgeTo: "#d946ef",
    glow: "rgba(139, 92, 246, 0.35)",
    accentText: "text-[#a78bfa]",
    borderAccent: "border-[#8b5cf6]/30",
    dotColor: "bg-[#8b5cf6]",
  },
  {
    gradient: "from-[#10b981]/25 via-[#06b6d4]/10 to-transparent",
    badgeFrom: "#10b981",
    badgeTo: "#059669",
    glow: "rgba(16, 185, 129, 0.35)",
    accentText: "text-[#34d399]",
    borderAccent: "border-[#10b981]/30",
    dotColor: "bg-[#10b981]",
  },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getProjectIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("photo") || lower.includes("snap") || lower.includes("camera") || lower.includes("booth")) {
    return Camera;
  }
  if (lower.includes("shop") || lower.includes("store") || lower.includes("market") || lower.includes("pay") || lower.includes("pos")) {
    return ShoppingBag;
  }
  if (lower.includes("ai") || lower.includes("gpt") || lower.includes("bot") || lower.includes("brain") || lower.includes("smart")) {
    return FolderGit2;
  }
  if (lower.includes("data") || lower.includes("sql") || lower.includes("db") || lower.includes("cloud")) {
    return Database;
  }
  if (lower.includes("mobile") || lower.includes("app") || lower.includes("android") || lower.includes("ios")) {
    return Smartphone;
  }
  if (lower.includes("sys") || lower.includes("engine") || lower.includes("core")) {
    return Cpu;
  }
  if (lower.includes("web") || lower.includes("net") || lower.includes("site") || lower.includes("portal")) {
    return Globe;
  }
  if (lower.includes("code") || lower.includes("dev") || lower.includes("api") || lower.includes("cli")) {
    return Code2;
  }
  return Layers;
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

export function ProjectPlaceholder({ project }: { project: Project }) {
  const theme = useMemo(() => {
    const hash = hashString(project.title || project.id);
    return THEMES[hash % THEMES.length];
  }, [project.title, project.id]);

  const IconComponent = useMemo(() => getProjectIcon(project.title), [project.title]);
  const pascalName = useMemo(() => toPascalCase(project.title) || "App", [project.title]);
  const slug = project.slug || project.title.toLowerCase().replace(/\s+/g, "-");
  const isInProgress = project.status === "in_progress";

  const stacks = project.tech_stacks || [];

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#0a0b0e] p-3 sm:p-4 select-none">
      {/* Subtle cyber grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hero-grid opacity-30"
      />

      {/* Ambient glowing radial gradient */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -bottom-10 inset-x-0 h-48 bg-gradient-to-t ${theme.gradient} blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Modern Developer IDE / App Window Mockup */}
      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#121319]/90 backdrop-blur-md shadow-2xl transition-all duration-500 group-hover:border-white/20 group-hover:scale-[1.01]">
        {/* Window Titlebar */}
        <div className="flex h-8 sm:h-9 items-center justify-between border-b border-white/5 bg-[#171821]/80 px-3">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>

          {/* Monospace file path pill */}
          <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] sm:text-[11px] font-mono text-zinc-400">
            <Terminal className={`h-3 w-3 ${theme.accentText}`} />
            <span className="truncate max-w-[130px] sm:max-w-[180px]">
              ~/projects/{slug}.tsx
            </span>
          </div>

          {/* Status badge pill */}
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono uppercase">
            {isInProgress ? (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                DEV
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                PROD
              </span>
            )}
          </div>
        </div>

        {/* Window Content Body */}
        <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
          {/* Header Row: Glowing Icon + Title */}
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-white/20 shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${theme.badgeFrom}, ${theme.badgeTo})`,
                boxShadow: `0 8px 24px ${theme.glow}`,
              }}
            >
              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                {isInProgress ? "// IN ACTIVE DEVELOPMENT" : "// SELECTED ARCHITECTURE"}
              </p>
              <h4 className="font-display text-sm sm:text-base font-bold text-zinc-100 tracking-tight truncate">
                {project.title}
              </h4>
            </div>
          </div>

          {/* Simulated Code Architecture Snippet */}
          <div className="my-2 rounded-md border border-white/5 bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className={theme.accentText}>const</span>
              <span className="text-zinc-100 font-semibold">{pascalName}</span>
              <span className="text-zinc-500">=</span>
              <span className="text-zinc-300">&#123;</span>
            </div>
            <div className="pl-4 text-[10px] sm:text-[11px] text-zinc-400">
              <span className="text-zinc-500">status:</span>{" "}
              <span className={isInProgress ? "text-amber-300" : "text-emerald-300"}>
                &quot;{isInProgress ? "building_features" : "verified_production"}&quot;
              </span>
              ,
            </div>
            <div className="flex items-center text-zinc-300">&#125;;</div>
          </div>

          {/* Bottom Tech Stack or Decorative Wireframe */}
          <div className="pt-1">
            {stacks.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {stacks.slice(0, 4).map((tech) => (
                  <div
                    key={tech.id}
                    className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300"
                  >
                    <TechIcon slug={tech.slug} name={tech.name} size={12} className="opacity-90" />
                    <span className="truncate max-w-[70px] sm:max-w-none">{tech.name}</span>
                  </div>
                ))}
                {stacks.length > 4 && (
                  <span className="text-[10px] font-mono text-zinc-500 pl-0.5">
                    +{stacks.length - 4}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1/2 rounded-full bg-white/10" />
                <div className="h-1.5 w-1/4 rounded-full bg-white/5" />
              </div>
            )}
          </div>
        </div>

        {/* Glass Light Sweep on Hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
        />
      </div>
    </div>
  );
}
