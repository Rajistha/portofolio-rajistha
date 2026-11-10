import type { Profile } from "@/types/database";

/**
 * Lightweight stand-in for the 3D lanyard: shown when the 3D card is turned
 * off in settings or the visitor's device/preferences call for less motion.
 */
export function StaticBadge({ profile }: { profile: Profile | null }) {
  const name = profile?.name ?? "Your Name";
  const role = profile?.role ?? "Front-End Developer";

  return (
    <div
      aria-hidden
      className="absolute right-16 top-1/2 hidden w-56 -translate-y-1/2 lg:block"
    >
      <div className="mx-auto h-10 w-px bg-border" />
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xl shadow-black/20">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-surface-2" />
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            decoding="async"
            className="mb-4 aspect-square w-full rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="hero-grid mb-4 aspect-square w-full rounded-xl border border-border bg-surface-2" />
        )}
        <p className="font-display text-lg leading-tight">
          {name}
          <span className="text-accent">.</span>
        </p>
        <p className="mt-1 text-xs text-muted">{role}</p>
      </div>
    </div>
  );
}
