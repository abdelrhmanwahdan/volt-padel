"use client";
import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/utils";
import { HOME_VIDEOS } from "@/lib/media";

// We pre-warm the HTTP cache for every home-page video so the scroll-scrub
// <video> elements get instant byte-range responses when their section enters
// the viewport. Source of truth lives in lib/media.ts so new chapters can't
// silently skip the preload step.
const VIDEOS_TO_PRELOAD = HOME_VIDEOS;

/**
 * Full-screen branded preloader.
 * - Renders during SSR so it covers the page from the very first paint
 *   (no flash of un-loaded home page).
 * - Waits for fonts + hero poster + `canplaythrough` on every home-page video
 *   before dismissing — eliminates the scroll-into-chapter lag.
 * Hard cap: 12s (don't punish slow networks indefinitely).
 * Soft min: 1.2s (don't flash by — give the brand impression a beat).
 * Shown once per session via sessionStorage; repeat visits skip it.
 */
export default function HeroLoader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  // Default: render the loader. We accept a sub-frame flash for repeat
  // visitors (sessionStorage skip runs in useEffect) to avoid the much worse
  // flash-of-homepage every first-time visitor was getting.
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
    let videosReady = 0;
    const VIDEO_COUNT = VIDEOS_TO_PRELOAD.length;
    let displayed = 0;
    let raf = 0;
    let finished = false;

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

    // Videos — preload each into HTTP cache. `canplaythrough` fires when the
    // browser estimates enough is buffered to play through; for scroll-scrub
    // it's the closest standard signal to "the file is downloaded".
    const videoEls: HTMLVideoElement[] = [];
    VIDEOS_TO_PRELOAD.forEach((path) => {
      const v = document.createElement("video");
      v.preload = "auto";
      v.muted = true;
      v.playsInline = true;
      const onReady = () => {
        videosReady++;
      };
      v.addEventListener("canplaythrough", onReady, { once: true });
      v.addEventListener("error", onReady, { once: true });
      v.src = mediaUrl(path);
      videoEls.push(v);
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
      const totalTasks = 2 + VIDEO_COUNT; // poster + fonts + each video
      const doneCount =
        (posterLoaded ? 1 : 0) + (fontsLoaded ? 1 : 0) + videosReady;
      // Task progress climbs to 1.0 when every asset is ready
      const taskTarget = 0.1 + (doneCount / totalTasks) * 0.9;
      // Time-based component nudges the bar when downloads stall, but only
      // floors at 0.92 if tasks aren't done yet — otherwise the bar would
      // visually stick at 92% even after everything finished.
      const elapsed = Date.now() - startTime;
      const allDone = doneCount === totalTasks;
      const timeTarget = allDone
        ? taskTarget
        : Math.min(0.92, elapsed / MAX_DURATION);
      const target = Math.max(taskTarget, timeTarget);
      displayed += (target - displayed) * 0.08;
      setProgress(displayed);

      if (elapsed > MAX_DURATION) return finish();
      if (doneCount === totalTasks && elapsed > MIN_DURATION) return finish();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      videoEls.forEach((v) => {
        v.src = "";
      });
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
