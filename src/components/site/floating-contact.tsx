"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Mail, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";

export function FloatingContact({ email = "pujarajistha@gmail.com" }: { email?: string | null }) {
  const { language } = useLanguage();
  const isId = language === "id";
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Auto-show after scrolling 350px, auto-hide when contact section is in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const contactEl = document.getElementById("contact");
      let nearFooter = false;

      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          nearFooter = true;
        }
      }

      if (scrollY > 350 && !nearFooter) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const waText = encodeURIComponent(
    isId
      ? "Halo Puja Rajistha, saya melihat portofolio Anda dan tertarik untuk berdiskusi mengenai proyek web."
      : "Hi Puja Rajistha, I saw your portfolio and would love to discuss a potential web project."
  );
  // Default WhatsApp link (using official shortlink or direct wa.me)
  const waUrl = `https://wa.me/6281234567890?text=${waText}`;

  function copyEmail() {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success(isId ? "Email disalin ke clipboard!" : "Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Expanded Quick Contact Menu */}
      {expanded && (
        <div className="rounded-2xl border border-border bg-surface/95 p-3.5 shadow-2xl backdrop-blur-md space-y-2 mb-1 w-64 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-xs font-mono font-semibold uppercase text-accent">
              {isId ? "Hubungi Cepat" : "Quick Contact"}
            </span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded p-0.5 text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <div className="text-left">
              <span className="block font-semibold">WhatsApp Chat</span>
              <span className="text-[10px] text-emerald-400/80 font-mono">Respon cepat (&lt; 1 jam)</span>
            </div>
          </a>

          {email && (
            <button
              type="button"
              onClick={copyEmail}
              className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent cursor-pointer"
            >
              <Mail className="h-4 w-4 shrink-0 text-accent" />
              <div className="text-left flex-1 min-w-0">
                <span className="block font-semibold truncate">{email}</span>
                <span className="text-[10px] text-muted font-mono">
                  {copied ? "Tersalin!" : "Klik untuk salin email"}
                </span>
              </div>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Main Floating Trigger Pill */}
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface/90 p-1.5 shadow-xl backdrop-blur-md transition-[color,background-color,border-color,box-shadow,transform,opacity,filter] hover:border-accent/50 hover:shadow-accent/10">
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 rounded-full bg-emerald-500/15 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-background"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <MessageCircle className="h-3.5 w-3.5" />
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
          title="Opsi kontak lainnya"
        >
          <Mail className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
