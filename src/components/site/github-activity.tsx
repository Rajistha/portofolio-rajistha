"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GitCommit, Flame, Trophy, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { useLanguage } from "@/components/language-provider";

export function GitHubActivity({
  username = "rajistha",
  githubUrl = "https://github.com/rajistha",
}: {
  username?: string;
  githubUrl?: string | null;
}) {
  const { language } = useLanguage();
  const isId = language === "id";
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);

  // Fallback initial data (past 52 weeks = 364 days)
  const fallbackData = useMemo(() => {
    const today = new Date();
    const cells: { date: string; count: number; level: number }[] = [];
    let total = 0;

    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const pseudo = (Math.sin(d.getTime() * 0.0000001) + 1) / 2;
      let count = 0;

      if (!isWeekend) {
        if (pseudo > 0.3) count = Math.floor(pseudo * 6) + 1;
      }
      total += count;

      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 5) level = 2;
      else if (count > 5 && count <= 9) level = 3;
      else if (count > 9) level = 4;

      cells.push({ date: dateStr, count, level });
    }

    const weekChunks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weekChunks.push(cells.slice(i, i + 7));
    }

    return {
      weeks: weekChunks,
      totalContribs: total,
      currentStreak: 1,
      longestStreak: 14,
      isRealData: false,
    };
  }, []);

  const [activityData, setActivityData] = useState(fallbackData);

  // Fetch real GitHub contribution data via public API
  useEffect(() => {
    let active = true;

    async function fetchRealGithubData() {
      try {
        const cacheKey = `gh_cache_${username}`;
        let json = null;
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) json = JSON.parse(cached);
        } catch {}

        if (!json) {
          const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
          if (!res.ok) return;
          json = await res.json();
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(json));
          } catch {}
        }

        if (!active || !json?.contributions || !Array.isArray(json.contributions)) return;

        const sorted = [...json.contributions].sort((a, b) => a.date.localeCompare(b.date));
        const last364 = sorted.slice(-364);
        const total = last364.reduce((sum, c) => sum + (c.count || 0), 0);

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        for (let i = 0; i < sorted.length; i++) {
          if (sorted[i].count > 0) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        }

        for (let i = sorted.length - 1; i >= 0; i--) {
          if (sorted[i].count > 0) {
            currentStreak++;
          } else if (currentStreak > 0) {
            break;
          }
        }

        const weekChunks: { date: string; count: number; level: number }[][] = [];
        for (let i = 0; i < last364.length; i += 7) {
          weekChunks.push(last364.slice(i, i + 7));
        }

        setActivityData({
          weeks: weekChunks,
          totalContribs: total,
          currentStreak,
          longestStreak,
          isRealData: true,
        });
      } catch {
        // Fallback maintained
      }
    }

    fetchRealGithubData();

    return () => {
      active = false;
    };
  }, [username]);

  const { weeks, totalContribs, currentStreak, longestStreak, isRealData } = activityData;

  const levelColors = [
    "bg-surface-2 border-border/30",
    "bg-emerald-950/60 border-emerald-800/40",
    "bg-emerald-700/70 border-emerald-600/50",
    "bg-emerald-500/80 border-emerald-400/60",
    "bg-emerald-400 border-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.5)]",
  ];

  const targetUrl = githubUrl || `https://github.com/${username}`;

  return (
    <section className="relative py-16 px-6 border-t border-border/50">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-border/70 bg-surface/60 p-6 sm:p-8 backdrop-blur-xs space-y-6"
        >
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GithubIcon size={20} className="text-accent" />
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  {isId ? "Aktivitas Kode & Kontribusi GitHub" : "GitHub Activity & Contributions"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted">
                {isId
                  ? `Jejak komit dan pengembangan perangkat lunak di @${username}`
                  : `Software engineering tracking and open-source contributions on @${username}`}
              </p>
            </div>

            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-border bg-surface-2 px-4 py-2 text-xs font-mono font-medium text-foreground hover:border-accent/50 hover:text-accent transition-colors"
            >
              <span>github.com/{username}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3 sm:p-4 flex items-center gap-3">
              <div className="rounded-lg bg-accent/15 p-2 text-accent">
                <GitCommit className="h-4 w-4" />
              </div>
              <div>
                <span className="font-display font-bold text-lg sm:text-xl text-foreground block">
                  {totalContribs.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-muted uppercase">
                  {isId ? "Kontribusi 1 Tahun" : "Total Commits (1Y)"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3 sm:p-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/15 p-2 text-amber-400">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <span className="font-display font-bold text-lg sm:text-xl text-foreground block">
                  {currentStreak} Hari
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-muted uppercase">
                  {isId ? "Streak Berjalan" : "Current Streak"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3 sm:p-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <span className="font-display font-bold text-lg sm:text-xl text-foreground block">
                  {longestStreak} Hari
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-muted uppercase">
                  {isId ? "Streak Terpanjang" : "Longest Streak"}
                </span>
              </div>
            </div>
          </div>

          {/* Contribution Grid */}
          <div className="space-y-2">
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="inline-flex gap-[3.5px] p-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3.5px]">
                    {week.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        onMouseEnter={() => setHoveredCell({ date: day.date, count: day.count })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-[11px] w-[11px] rounded-[2.5px] border transition-transform duration-150 hover:scale-125 cursor-pointer ${levelColors[day.level] || levelColors[0]}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Hover tooltip text & Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs text-muted pt-1">
              <div className="font-mono text-[11px]">
                {hoveredCell ? (
                  <span className="text-foreground">
                    <strong className="text-accent">{hoveredCell.count} kontribusi</strong> pada {hoveredCell.date}
                  </span>
                ) : (
                  <span>Hover kotak untuk detail tanggal &amp; kontribusi</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span>Kurang</span>
                <div className="flex items-center gap-1">
                  {levelColors.map((cls, idx) => (
                    <div key={idx} className={`h-2.5 w-2.5 rounded-[2px] border ${cls}`} />
                  ))}
                </div>
                <span>Banyak</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
