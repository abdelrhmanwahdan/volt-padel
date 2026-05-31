"use client";
import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/utils";

/**
 * Full-screen branded preloader.
 * Waits for fonts + hero poster + hero video metadata before dismissing.
 * Hard cap: 5s (don't make users wait if jsDelivr is slow).
 * Soft min: 1.2s (don't flash by — give the brand impression a beat).
 * Shows once per session (sessionStorage flag).
 */
export default function HeroLoader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(true);

  // Decide on mount whether to render at all
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("volt-loaded");
    if (!seen) setSkip(false);
  }, []);

  useEffect(() => {
    if (skip) return;

    const MIN_DURATION = 1200;
    const MAX_DURATION = 5000;
    const startTime = Date.now();

    let posterLoaded = false;
    let videoMetaLoaded = false;
    let fontsLoaded = false;
    let displayed = 0;
    let raf = 0;
    let finished = false;

    // Track fonts
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        fontsLoaded = true;
      });
    } else {
      fontsLoaded = true;
    }

    // Track poster
    const poster = new Image();
    poster.onload = () => {
      posterLoaded = true;
    };
    poster.onerror = () => {
      posterLoaded = true;
    };
    poster.src = "/posters/hero.webp";

    // Track hero video metadata
    const vid = document.createElement("video");
    vid.preload = "metadata";
    vid.muted = true;
    vid.playsInline = true;
    const onMeta = () => {
      videoMetaLoaded = true;
    };
    vid.addEventListener("loadedmetadata", onMeta);
    vid.addEventListener("error", onMeta);
    vid.src = mediaUrl("/videos/hero.mp4");

    const finish = () => {
      if (finished) return;
      finished = true;
      // Snap to 100% then fade out
      displayed = 1;
      setProgress(1);
      setTimeout(() => setDone(true), 250);
      setTimeout(() => {
        sessionStorage.setItem("volt-loaded", "1");
      }, 800);
    };

    const tick = () => {
      const done3 = [posterLoaded, videoMetaLoaded, fontsLoaded].filter(Boolean).length;
      // Target ramps to 0.9 based on tasks complete, holds there until min duration
      const taskTarget = 0.15 + (done3 / 3) * 0.75;
      // Add a small time-based component so the bar visibly progresses
      const elapsed = Date.now() - startTime;
      const timeTarget = Math.min(0.92, elapsed / MAX_DURATION);
      const target = Math.max(taskTarget, timeTarget);
      // Smooth toward target
      displayed += (target - displayed) * 0.08;
      setProgress(displayed);

      if (elapsed > MAX_DURATION) return finish();
      if (done3 === 3 && elapsed > MIN_DURATION) return finish();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      vid.removeEventListener("loadedmetadata", onMeta);
      vid.removeEventListener("error", onMeta);
      vid.src = "";
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
          fontFamily: "var(--font-display)",
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

      <style jsx>{`
        @keyframes voltpulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
