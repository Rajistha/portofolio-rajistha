"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back!");
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6">
      <ThemeToggle className="absolute right-6 top-6" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-lg border border-border bg-surface p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full border border-accent/30 p-3 text-accent">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl">Admin Sign In</h1>
          <p className="text-sm text-muted">
            Sign in to manage your projects and tech stack.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
              Email
            </label>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" aria-live="assertive" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-medium text-background transition-opacity disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
