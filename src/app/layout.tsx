import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AppToaster } from "@/components/app-toaster";
import { MotionProvider } from "@/components/motion-provider";
import { LanguageProvider } from "@/components/language-provider";
import { HydrationSignal } from "@/components/site/hydration-signal";
import { PageTracker } from "@/components/site/page-tracker";
import { getSiteSettings } from "@/lib/data-public";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const defaultTitle = "Puja Rajistha";
const defaultDescription = "Front-end developer portfolio — crafting fast, elegant, and accessible web experiences.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: "%s",
  },
  description: defaultDescription,
  keywords: ["Rajistha", "Puja Rajistha", "Front-End Developer", "Web Developer", "Portfolio"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Rajistha",
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <head>
        {/* Preload the hero lanyard's heaviest asset so it's already in
            flight by the time the 3D component's JS chunk finishes loading. */}
        <link
          rel="preload"
          href="/lanyard/card.glb"
          as="fetch"
          crossOrigin="anonymous"
          media="(min-width: 1024px)"
        />
        {/* Filter Three.js & Rapier deprecation warnings — runs in <head> before any JS bundle */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var _w = console.warn;
                console.warn = function() {
                  var msg = arguments[0];
                  if (typeof msg === 'string' && (
                    msg.indexOf('THREE.Clock') !== -1 ||
                    msg.indexOf('using deprecated parameters for the initialization function') !== -1
                  )) return;
                  _w.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent/30 selection:text-foreground">
        {/* Preloader: injected as FIRST child of <body> so document.body exists */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Skipped when turned off in admin settings or the visitor prefers reduced motion.
                if (!${settings.preloader_enabled}) return;
                // The intro belongs to the landing experience only — not the CV viewer or admin.
                if (['/cv', '/admin'].some(function(p) { return location.pathname === p || location.pathname.indexOf(p + '/') === 0; })) return;
                try {
                  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                } catch(e) {}
                try {
                  var SEEN_KEY = 'portfolio_intro_v5';
                  if (sessionStorage.getItem(SEEN_KEY) === 'true') return;
                  sessionStorage.setItem(SEEN_KEY, 'true');
                } catch(e) { /* private/strict mode: show once, then skip */ }

                // Flag that preloader is currently running
                window.__preloader_active = true;

                // Inject keyframe animation (progress fill only, no pulsing)
                var style = document.createElement('style');
                style.textContent =
                  '@keyframes _pl_fill{0%{transform:scaleX(0)}20%{transform:scaleX(.28)}50%{transform:scaleX(.62)}80%{transform:scaleX(.88)}100%{transform:scaleX(1)}}';
                document.head.appendChild(style);

                // Build overlay element
                var el = document.createElement('div');
                el.id = '__preloader';
                el.style.cssText =
                  'position:fixed;inset:0;z-index:9999;' +
                  'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                  'background:#0a0a0b;color:#ededec;overflow:hidden;cursor:pointer;' +
                  'transition:transform 0.85s cubic-bezier(0.76,0,0.24,1);will-change:transform;' +
                  'border-bottom:1px solid rgba(255,107,74,0.35);';

                var logoSvg =
                  '<svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<defs>' +
                      '<linearGradient id="r-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">' +
                        '<stop offset="0%" stop-color="#ff7b54"/>' +
                        '<stop offset="100%" stop-color="#e2481f"/>' +
                      '</linearGradient>' +
                      '<linearGradient id="r-grad-slash" x1="0%" y1="0%" x2="100%" y2="100%">' +
                        '<stop offset="0%" stop-color="#ffffff"/>' +
                        '<stop offset="50%" stop-color="#ff8a65"/>' +
                        '<stop offset="100%" stop-color="#ff411f"/>' +
                      '</linearGradient>' +
                    '</defs>' +
                    '<rect x="5" y="5" width="90" height="90" rx="24" fill="#111113" stroke="#26262a" stroke-width="3"/>' +
                    '<rect x="10" y="10" width="80" height="80" rx="20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/>' +
                    '<g>' +
                      '<rect x="24" y="22" width="15" height="56" rx="5" fill="url(#r-grad-primary)"/>' +
                      '<path d="M 36 22 L 56 22 C 67 22 74 28 74 38 C 74 48 67 54 56 54 L 36 54 Z" fill="url(#r-grad-primary)"/>' +
                      '<path d="M 39 33 L 53 33 C 58.5 33 62 35 62 38 C 62 41 58.5 43 53 43 L 39 43 Z" fill="#111113"/>' +
                      '<path d="M 48 48 L 68 75 C 69.5 77 72 78 75 78 L 78 78 C 79 78 79.5 76.8 78.5 75.5 L 59 48 Z" fill="url(#r-grad-slash)"/>' +
                      '<circle cx="75" cy="24" r="3.5" fill="#ff7b54"/>' +
                    '</g>' +
                  '</svg>';

                el.innerHTML =
                  '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,107,74,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,74,.04) 1px,transparent 1px);background-size:48px 48px;pointer-events:none"></div>' +
                  '<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 24px;pointer-events:none">' +
                    '<div style="margin-bottom:24px">' +
                      logoSvg +
                    '</div>' +
                    '<h2 style="font-family:system-ui,sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.5px;margin:0 0 24px;color:#ededec">Puja Rajistha<span style="color:#ff6b4a">.</span></h2>' +
                    '<div style="width:280px;max-width:90vw">' +
                      '<div style="height:6px;width:100%;border-radius:9999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);padding:1px;margin-bottom:10px;overflow:hidden">' +
                        '<div id="__pl_bar" style="height:100%;width:100%;transform-origin:left center;will-change:transform;border-radius:9999px;background:linear-gradient(90deg,#ff6b4a,#ff9e7d);box-shadow:0 0 10px rgba(255,107,74,.5);animation:_pl_fill 1.2s cubic-bezier(0.2,0.8,0.2,1) forwards"></div>' +
                      '</div>' +
                      '<div style="display:flex;justify-content:space-between;font-size:11px;font-family:ui-monospace,monospace;color:rgba(237,237,236,.45)">' +
                        '<span id="__pl_status">&gt; Initializing...</span>' +
                        '<span id="__pl_pct">0%</span>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#ff6b4a,transparent);opacity:.7;pointer-events:none"></div>' +
                  '<div id="__pl_skip" style="position:absolute;bottom:20px;left:0;right:0;text-align:center;font-size:11px;font-family:ui-monospace,monospace;color:rgba(237,237,236,.3)">[Klik atau ESC untuk skip]</div>';

                document.body.appendChild(el);

                // Percentage counter & readiness sync
                var msgs = [
                  [0,  '> Initializing developer environment...'],
                  [25, '> Compiling 3D interactive engine...'],
                  [52, '> Fetching tech stack & projects...'],
                  [78, '> Optimizing interface layout...'],
                  [98, '> System ready // Welcome!'],
                ];
                var pctEl = document.getElementById('__pl_pct');
                var stEl  = document.getElementById('__pl_status');
                var t0 = performance.now();
                var lastPct = -1;
                var DUR = 1200;
                var progressDone = false;
                var appReady = window.__portfolio_ready === true;
                var dismissed = false;

                function checkAndDismiss() {
                  if (dismissed) return;
                  if (progressDone && appReady) {
                    dismiss();
                  }
                }

                if (!appReady) {
                  window.addEventListener('portfolio:ready', function() {
                    appReady = true;
                    checkAndDismiss();
                  }, { once: true });
                }

                function tick() {
                  var elapsed = performance.now() - t0;
                  var pct = Math.min(Math.round((elapsed / DUR) * 100), 100);
                  if (pct !== lastPct) {
                    lastPct = pct;
                    if (pctEl) pctEl.textContent = pct + '%';
                    if (stEl) {
                      for (var i = msgs.length - 1; i >= 0; i--) {
                        if (pct >= msgs[i][0]) { stEl.textContent = msgs[i][1]; break; }
                      }
                    }
                  }
                  if (pct < 100) {
                    requestAnimationFrame(tick);
                  } else {
                    progressDone = true;
                    if (appReady) {
                      setTimeout(dismiss, 80);
                    } else {
                      if (stEl) stEl.textContent = '> System ready // Welcome!';
                    }
                  }
                }
                requestAnimationFrame(tick);

                // Dismiss with swipe-up (immediately disable pointer events so clicks go through)
                function dismiss() {
                  if (dismissed) return;
                  dismissed = true;
                  window.__preloader_active = false;
                  window.dispatchEvent(new Event('preloader:swipe'));
                  el.style.pointerEvents = 'none';
                  var s = document.getElementById('__pl_skip');
                  if (s) s.style.opacity = '0';
                  el.style.transform = 'translateY(-100%)';
                  setTimeout(function() { el.parentNode && el.parentNode.removeChild(el); }, 750);
                }

                // Hard fallback: dismiss after 2200ms max
                setTimeout(dismiss, 2200);

                el.addEventListener('click', dismiss);
                document.addEventListener('keydown', function(e) {
                  if (e.key === 'Escape') dismiss();
                }, { once: true });
              })();
            `,
          }}
        />
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-100 focus-visible:rounded-md focus-visible:bg-foreground focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-background"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider>
            <MotionProvider>
              {children}
              <AppToaster />
              <HydrationSignal />
              <PageTracker />
            </MotionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
