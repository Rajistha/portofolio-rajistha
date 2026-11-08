"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export type ConfirmDialogProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmDialog({
  isOpen,
  title = "Konfirmasi Tindakan",
  description = "Apakah Anda yakin ingin melanjutkan tindakan ini? Tindakan ini tidak dapat dibatalkan.",
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape, focus confirm button on open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
              variant === "danger"
                ? "bg-red-500/10 border-red-500/25 text-red-400"
                : "bg-amber-500/10 border-amber-500/25 text-amber-400"
            }`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
              {title}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-opacity disabled:opacity-50 shadow-xs ${
              variant === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-accent hover:opacity-90"
            }`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isLoading ? "Memproses..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
