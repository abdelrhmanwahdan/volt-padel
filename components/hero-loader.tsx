"use client";
import { useEffect, useState } from "react";
import { SCRUB_SECTIONS, TOTAL_SCRUB_FRAMES } from "@/lib/scrub-sections";

/**
 * Full-screen branded preloader.
 *
 * Waits for ALL of:
 *   - Fonts loaded (`document.fonts.ready`)
 *   - Hero poster decoded
 *   - EVERY scroll-scrub frame loaded (hero + charge + impact, 234 frames,
 *     ~9.2 MB) — so by the time the loader dismisses, every chapter's
 *     scrub is already in the HTTP cache and runs without stutter even on
 *     a slow connection.
 *   - `window.load` event (every <link>, <script>, above-fold image done)
 *
 * MAX_DURATION is 30s rather than the earlier 12s because the 9.2 MB
 * frame payload takes ~15s on a 5 Mbps connection and ~50s on slow 3G;
 * 30s is a hard ceiling that prevents lockout on terrible networks while
 * giving normal connections plenty of time to finish.
 *
 * Soft min: 1.2s (don't flash by).
 * Shown once per session via sessionStorage.
 */

const frameUrl = (dir: string, i: number) =>
  `${dir}/${i.toString().padStart(4, "0")}.webp`;

export default function HeroLoader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("volt-loaded")) setSkip(true);
  }, []);

  useEffect(() => {
    if (skip) return;

    const MIN_DURATION = 1200;
    const MAX_DURATION = 30000;
    const startTime = Date.now();

    let posterLoaded = false;
    let fontsLoaded = false;
    let framesLoadedCount = 0;
    let windowLoaded = false;
    let displayed = 0;
    let raf = 0;
    let finished = false;

    // Fonts
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        fontsLoaded = true;
      });
    } else {
      fontsLoaded = true;
    }

    // Poster
    const poster = new Image();
    const markPoster = () => {
      posterLoaded = true;
    };
    poster.addEventListener("load", markPoster, { once: true });
    poster.addEventListener("error", markPoster, { once: true });
    poster.src = "/posters/hero.webp";

    // Every frame from every scrub section, in parallel via <img>. Each
    // request lands in the HTTP cache; ScrollScrubVideo's own <img>
    // elements then hit the cache. By design the loader does NOT dismiss
    // until every frame is reachable from cache.
    const frameImgs: HTMLImageElement[] = [];
    for (const section of SCRUB_SECTIONS) {
      for (let i = 1; i <= section.framesCount; i++) {
        const img = new Image();
        const mark = () => {
          framesLoadedCount++;
        };
        img.addEventListener("load", mark, { once: true });
        img.addEventListener("error", mark, { once: true });
        img.src = frameUrl(section.framesDir, i);
        frameImgs.push(img);
      }
    }

    // Window load — fires after every <link>, <script>, above-fold <img>.
    if (document.readyState === "complete") {
      windowLoaded = true;
    } else {
      window.addEventListener(
        "load",
        () => {
          windowLoaded = true;
        },
        { once: true },
      );
    }

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
      const framesProgress = framesLoadedCount / TOTAL_SCRUB_FRAMES;
      const taskProgress =
        (Number(posterLoaded) +
          Number(fontsLoaded) +
          framesProgress +
          Number(windowLoaded)) /
        4;
      const taskTarget = 0.1 + taskProgress * 0.9;
      const elapsed = Date.now() - startTime;
      const allDone =
        posterLoaded &&
        fontsLoaded &&
        framesLoadedCount >= TOTAL_SCRUB_FRAMES &&
        windowLoaded;
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
      cancelAnimationFrame(raf);
      poster.src = "";
      for (const img of frameImgs) img.src = "";
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

      <div className="mt-10 w-44 sm:w-56 h-[2px] bg-border overflow-hidden rounded-full">
        <div
          className="h-full bg-accent origin-left will-change-transform"
          style={{
            transform: `scaleX(${progress})`,
            boxShadow: "0 0 12px var(--color-accent)",
          }}
        />
      </div>

      <div
        className="mt-4 text-[10px] font-mono tracking-[0.18em] text-fg-muted tabular-nums"
        style={{ fontFamily: "var(--font-numeric)" }}
      >
        CHARGING · {String(Math.round(progress * 100)).padStart(3, "0")}%
      </div>
    </div>
  );
}
