"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Minus, Plus, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { trackEvent } from "@/lib/track";
import { useDismissableOverlay } from "@/hooks/use-dismissable-overlay";
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist";

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.2;
const MAX_PAGE_WIDTH = 880;
// JPEG2000/other decoders pdf.js loads on demand (e.g. the photo in the CV).
const WASM_URL = "/pdfjs/wasm/";

/**
 * Without `onClose` this is the full-page viewer used by /cv. With it, it
 * renders as an overlay on top of the current page (Google Classroom style).
 */
export function CvViewer({ name, src, onClose }: { name: string; src: string; onClose?: () => void }) {
  const overlay = Boolean(onClose);
  useDismissableOverlay(overlay, onClose ?? (() => {}));
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(0);

  // Load the document once.
  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        // Straight from storage/CDN first (no server hop); fall back to the proxy.
        let doc: PDFDocumentProxy;
        try {
          task = pdfjs.getDocument({ url: src, wasmUrl: WASM_URL });
          doc = await task.promise;
        } catch {
          task?.destroy();
          task = pdfjs.getDocument({ url: "/cv/file", wasmUrl: WASM_URL });
          doc = await task.promise;
        }
        if (cancelled) return;
        setPdf(doc);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [src]);

  // Track available width so pages fit the screen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Render every page to a canvas whenever the document, zoom or width changes.
  useEffect(() => {
    const host = pagesRef.current;
    if (!pdf || !host || !width) return;
    let cancelled = false;
    const tasks: { cancel: () => void }[] = [];

    (async () => {
      const targetWidth = Math.min(MAX_PAGE_WIDTH, width - 32) * zoom;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvases: HTMLCanvasElement[] = [];
      // First paint: show each page as soon as it's ready instead of waiting for all.
      const progressive = host.childElementCount === 0;

      for (let n = 1; n <= pdf.numPages; n++) {
        const pg = await pdf.getPage(n);
        if (cancelled) return;
        const base = pg.getViewport({ scale: 1 });
        const viewport = pg.getViewport({ scale: (targetWidth / base.width) * dpr });

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
        canvas.className = "block max-w-none rounded-md bg-white shadow-2xl shadow-black/30 ring-1 ring-border";

        const task = pg.render({ canvas, viewport });
        tasks.push(task);
        await task.promise.catch(() => {});
        if (cancelled) return;
        canvases.push(canvas);
        if (progressive) host.appendChild(canvas);
      }
      if (!progressive) host.replaceChildren(...canvases);
    })();

    return () => {
      cancelled = true;
      tasks.forEach((t) => t.cancel());
    };
  }, [pdf, zoom, width]);

  // Which page is in view.
  const onScroll = useCallback(() => {
    const el = containerRef.current;
    const host = pagesRef.current;
    if (!el || !host) return;
    const mid = el.getBoundingClientRect().top + el.clientHeight / 2;
    let current = 1;
    host.querySelectorAll("canvas").forEach((c, i) => {
      if (c.getBoundingClientRect().top <= mid) current = i + 1;
    });
    setPage(current);
  }, []);

  const total = pdf?.numPages ?? 0;
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:pointer-events-none disabled:opacity-40";

  return (
    <div
      className={
        overlay
          ? "fixed inset-0 z-[200] flex animate-[cv-fade_0.18s_ease-out] flex-col bg-black/85 backdrop-blur-sm"
          : "fixed inset-0 z-50 flex flex-col bg-background"
      }
      role={overlay ? "dialog" : undefined}
      aria-modal={overlay || undefined}
      aria-label={overlay ? "Curriculum Vitae" : undefined}
    >
      <header className={`flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 ${overlay ? "bg-background/90 backdrop-blur" : "border-b border-border bg-background/80 backdrop-blur"}`}>
        <div className="flex min-w-0 items-center gap-3">
          {overlay ? (
            <button type="button" onClick={onClose} aria-label="Tutup" className={btn}>
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Link href="/" aria-label="Kembali ke beranda" className={btn}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-base">
              {name}
              <span className="text-accent">.</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Curriculum Vitae{total > 1 ? ` · ${page}/${total}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              aria-label="Perkecil"
              className={btn}
              disabled={zoom <= MIN_ZOOM}
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="w-12 text-center font-mono text-xs text-muted transition-colors hover:text-accent"
              aria-label="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              aria-label="Perbesar"
              className={btn}
              disabled={zoom >= MAX_ZOOM}
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {!overlay && <ThemeToggle className="h-9 w-9" />}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download route, not a page */}
          <a
            href="/cv/file?download"
            onClick={() => trackEvent("cv_download")}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Unduh</span>
          </a>
        </div>
      </header>

      <div
        ref={containerRef}
        onScroll={onScroll}
        onClick={overlay ? (e) => { if (!(e.target instanceof HTMLCanvasElement)) onClose?.(); } : undefined}
        className={`relative min-h-0 flex-1 overflow-auto ${overlay ? "" : "bg-surface-2/40"}`}
      >
        {status === "loading" && (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat CV…
          </div>
        )}
        {status === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted">
            <p>CV tidak dapat ditampilkan di sini.</p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file route, not a page */}
            <a
              href="/cv/file"
              className="rounded-md border border-border px-4 py-2 text-foreground transition-colors hover:border-accent/60 hover:text-accent"
            >
              Buka file langsung
            </a>
          </div>
        )}
        <div
          ref={pagesRef}
          className="mx-auto flex w-max min-w-full flex-col items-center gap-5 px-4 py-6 sm:py-8"
        />
      </div>
    </div>
  );
}
