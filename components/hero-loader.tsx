"use client";
import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/utils";

/**
 * Full-screen branded preloader.
 *
 * Waits for fonts + hero poster + hero-video metadata before dismissing.
 * That's the only thing visible above the fold — chapter videos are gated
 * by ScrollScrubVideo's IntersectionObserver (rootMargin: "100% 0px") so
 * they pre-arm one viewport early without needing to be preloaded here.
 *
 * Earlier versions preloaded all chapter videos via off-DOM <video> elements,
 * but the Range requests from the preload didn't share cache with the real
 * <video> Range requests on jsDelivr — every video was downloaded twice
 * (~70MB wasted) and the loader sat for 20s waiting on canplaythrough.
 *
 * Soft min: 1.2s (don't flash by — give the brand impression a beat).
 * Hard cap: 5s.
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
    const MAX_DURATION = 5000;
    const startTime = Date.now();

    let posterLoaded = false;
    let fontsLoaded = false;
    let heroMetaLoaded = false;
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

    // Hero video metadata only — enough to know the file exists and the
    // hero section can render without poster-flash. We deliberately do NOT
    // wait for canplaythrough (that ends up downloading the entire file,
    // and the real <video> element will issue its own Range request anyway).
    const heroVid = document.createElement("video");
    heroVid.preload = "metadata";
    heroVid.muted = true;
    heroVid.playsInline = true;
    const onMeta = () => {
      heroMetaLoaded = true;
    };
    heroVid.addEventListener("loadedmetadata", onMeta, { once: true });
    heroVid.addEventListener("error", onMeta, { once: true });
    heroVid.src = mediaUrl("/videos/hero.mp4");

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
      const totalTasks = 3; // poster + fonts + hero meta
      const doneCount =
        (posterLoaded ? 1 : 0) + (fontsLoaded ? 1 : 0) + (heroMetaLoaded ? 1 : 0);
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
      cancelAnimationFrame(raf);
      heroVid.removeEventListener("loadedmetadata", onMeta);
      heroVid.removeEventListener("error", onMeta);
      heroVid.src = "";
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
