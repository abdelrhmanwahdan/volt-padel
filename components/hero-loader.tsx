"use client";
import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/utils";

/**
 * Full-screen branded preloader.
 *
 * Waits for fonts + hero poster + hero-video bytes (via fetch) before
 * dismissing. The fetch downloads the full hero.mp4 into the HTTP cache —
 * the real <video> element's subsequent Range requests are then served
 * from cache with no network round-trip, so the scroll-scrub has a full
 * buffer the moment the user starts scrolling.
 *
 * Why fetch() instead of preload="auto" / preload="metadata"? Earlier
 * attempts used off-DOM <video> elements; their Range requests didn't
 * dedupe with the real <video>'s Range requests on jsDelivr, so every
 * video was downloaded twice. A plain fetch() returns a single full 200
 * response that the browser's HTTP cache then serves to subsequent Range
 * requests — one download, perfectly reusable.
 *
 * Chapter videos are NOT preloaded here. They're gated by
 * ScrollScrubVideo's IntersectionObserver (rootMargin: "100% 0px") so
 * they pre-arm one viewport early.
 *
 * Soft min: 1.2s (don't flash by — give the brand impression a beat).
 * Hard cap: 12s (on a 10 Mbps connection, 11.6 MB hero takes ~10s).
 * Shown once per session via sessionStorage; repeat visits skip it.
 */
export default function HeroLoader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  // Default: render the loader. Repeat visitors get a sub-frame flash before
  // useEffect dismisses — acceptable trade-off versus the flash-of-homepage
  // every first-time visitor used to see.
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("volt-loaded")) setSkip(true);
  }, []);

  useEffect(() => {
    if (skip) return;

    const MIN_DURATION = 1200;
    const MAX_DURATION = 12000;
    const startTime = Date.now();

    let posterLoaded = false;
    let fontsLoaded = false;
    let heroBytesLoaded = false;
    let displayed = 0;
    let raf = 0;
    let finished = false;
    let aborted = false;
    const abortCtl = new AbortController();

    // Fonts
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        fontsLoaded = true;
      });
    } else {
      fontsLoaded = true;
    }

    // Poster
    const poster = new Image();
    poster.onload = () => {
      posterLoaded = true;
    };
    poster.onerror = () => {
      posterLoaded = true;
    };
    poster.src = "/posters/hero.webp";

    // Hero video bytes — full file via fetch(). The browser caches the 200
    // response and serves the real <video> element's later Range requests
    // straight from cache, no network round-trip. By the time the loader
    // dismisses, the entire scroll-scrub timeline is reachable instantly.
    fetch(mediaUrl("/videos/hero.mp4"), { signal: abortCtl.signal })
      .then((r) => r.blob())
      .then(() => {
        if (!aborted) heroBytesLoaded = true;
      })
      .catch(() => {
        // Network error or aborted — don't block the loader forever.
        if (!aborted) heroBytesLoaded = true;
      });

    const finish = () => {
      if (finished) return;
      finished = true;
      displayed = 1;
      setProgress(1);
      setTimeout(() => setDone(true), 250);
      setTimeout(() => {
        sessionStorage.setItem("volt-loaded", "1");
      }, 800);
    };

    const tick = () => {
      const totalTasks = 3; // poster + fonts + hero bytes
      const doneCount =
        (posterLoaded ? 1 : 0) + (fontsLoaded ? 1 : 0) + (heroBytesLoaded ? 1 : 0);
      const taskTarget = 0.1 + (doneCount / totalTasks) * 0.9;
      const elapsed = Date.now() - startTime;
      const allDone = doneCount === totalTasks;
      const timeTarget = allDone
        ? taskTarget
        : Math.min(0.92, elapsed / MAX_DURATION);
      const target = Math.max(taskTarget, timeTarget);
      displayed += (target - displayed) * 0.08;
      setProgress(displayed);

      if (elapsed > MAX_DURATION) return finish();
      if (allDone && elapsed > MIN_DURATION) return finish();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      aborted = true;
      abortCtl.abort();
      cancelAnimationFrame(raf);
    };
  }, [skip]);

  if (skip) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center transition-opacity duration-[600ms] ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ visibility: done && progress === 1 ? "hidden" : "visible" }}
    >
      {/* Pulsing accent glow — sits behind the wordmark */}
      <div
        className="absolute w-[40vw] h-[40vw] max-w-[420px] max-h-[420px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent) 0%, transparent 60%)",
          opacity: 0.18 + progress * 0.22,
          filter: "blur(60px)",
          animation: "voltpulse 2.2s ease-in-out infinite",
        }}
      />

      {/* Wordmark — same font as the hero */}
      <div
        className="relative font-[var(--font-display)] font-black text-fg select-none"
        style={{
          fontSize: "clamp(4rem, 14vw, 9rem)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        VÖLT
      </div>

      {/* Progress bar */}
      <div className="mt-10 w-44 sm:w-56 h-[2px] bg-border overflow-hidden rounded-full">
        <div
          className="h-full bg-accent origin-left will-change-transform"
          style={{
            transform: `scaleX(${progress})`,
            boxShadow: "0 0 12px var(--color-accent)",
          }}
        />
      </div>

      {/* Label */}
      <div
        className="mt-4 text-[10px] font-mono tracking-[0.18em] text-fg-muted tabular-nums"
        style={{ fontFamily: "var(--font-numeric)" }}
      >
        CHARGING · {String(Math.round(progress * 100)).padStart(3, "0")}%
      </div>
    </div>
  );
}
