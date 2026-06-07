"use client";
import { useEffect, useState } from "react";

/**
 * Full-screen branded preloader.
 *
 * Waits for ALL of:
 *   - Fonts loaded (`document.fonts.ready`)
 *   - Hero poster decoded
 *   - First 12 hero scrub frames loaded (≈1s of scrub coverage from frame 0)
 *   - `window.load` event (every <link>, <script>, above-fold image done)
 *
 * The 12 critical frames give the scrub a head start the moment the user
 * begins scrolling. The remaining frames (13–96) idle-load via the
 * ScrollScrubVideo component's IntersectionObserver — they trickle in while
 * the user reads the hero, and findNearest() in ScrollScrubVideo falls back
 * to the closest loaded frame if scroll outruns the download.
 *
 * Soft min: 1.2s (don't flash by — give the brand impression a beat).
 * Hard cap: 12s (slow 3G must not lock the user out forever).
 * Shown once per session via sessionStorage.
 */

const HERO_FRAMES_DIR = "/scrub/hero";
const HERO_CRITICAL_FRAMES = 12;
const heroFrameUrl = (i: number) =>
  `${HERO_FRAMES_DIR}/${i.toString().padStart(4, "0")}.webp`;

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
    const MAX_DURATION = 12000;
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

    // Critical hero frames — fetch in parallel via <img>. The browser caches
    // each frame; ScrollScrubVideo's <img> elements then hit the cache.
    const frameImgs = Array.from({ length: HERO_CRITICAL_FRAMES }, (_, i) => {
      const img = new Image();
      const mark = () => {
        framesLoadedCount++;
      };
      img.addEventListener("load", mark, { once: true });
      img.addEventListener("error", mark, { once: true });
      img.src = heroFrameUrl(i + 1);
      return img;
    });

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
      // 4 weighted task groups: poster, fonts, critical frames, window-load
      const framesProgress = framesLoadedCount / HERO_CRITICAL_FRAMES;
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
        framesLoadedCount >= HERO_CRITICAL_FRAMES &&
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
      // Cancel pending image loads so we don't leak when navigation happens
      // mid-load — clearing src is the cross-browser way to abort an Image
      // download.
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
